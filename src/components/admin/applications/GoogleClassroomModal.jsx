import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  ExternalLink,
  Send,
  BookOpen,
  Megaphone,
  Lock,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { stripRichText } from '@/lib/richDescription';

export const ALLOWED_CLASSROOM_EMAIL = 'max@escapetsunamifordevelopers.com';
export const GOOGLE_CLASSROOM_CONNECTOR_ID = '';

export function canUseGoogleClassroom(user) {
  return (
    typeof user?.email === 'string' &&
    user.email.trim().toLowerCase() === ALLOWED_CLASSROOM_EMAIL
  );
}

export default function GoogleClassroomModal({ open, onClose, application, user }) {
  const { toast } = useToast();
  const [authedUser, setAuthedUser] = useState(user || null);
  const [courses, setCourses] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [postType, setPostType] = useState('assignment'); // 'assignment' | 'announcement'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');
  const [statusMsg, setStatusMsg] = useState('');
  const [postedUrl, setPostedUrl] = useState('');

  const appUrl = application
    ? `${window.location.origin}/apply/${application.slug || application.id}`
    : '';

  // Rule 2: reusable fetch — doubles as connection check AND data loader
  const loadCourses = async () => {
    if (!GOOGLE_CLASSROOM_CONNECTOR_ID) {
      setConnected(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await base44.functions.invoke('googleClassroom', {
        action: 'listCourses',
        connectorId: GOOGLE_CLASSROOM_CONNECTOR_ID,
      });
      if (res.data?.connected) {
        setConnected(true);
        setCourses(res.data.courses || []);
        if (res.data?.apiError && res.data?.error) {
          setStatusMsg(res.data.error);
        }
      } else {
        setConnected(false);
        setCourses([]);
      }
    } catch {
      setConnected(false);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Rule 1+2: check auth first, then fetch to detect connection status
  useEffect(() => {
    if (!open || !application) return;
    setSelectedCourse(null);
    setPostedUrl('');
    setStatusMsg('');
    setTitle(application.title || 'Application');
    const cleanDesc = stripRichText(application.description || '');
    setDescription(
      cleanDesc
        ? `${cleanDesc}\n\nComplete the application here: ${appUrl}`
        : `Please complete the "${application.title}" application via the portal link below:\n${appUrl}`
    );
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setAuthedUser(me);
        if (canUseGoogleClassroom(me)) {
          await loadCourses();
          return;
        }
      }
      setLoading(false);
    });
  }, [open, application?.id]);

  // Rule 3: open OAuth popup, poll for close, then re-fetch
  const handleConnectGoogle = async () => {
    setStatusMsg('');
    if (!GOOGLE_CLASSROOM_CONNECTOR_ID) {
      toast({
        title: 'Finish Google Classroom Connector Setup',
        description: 'Submit the Google OAuth credentials card in chat to finish enabling Google Classroom sign-in.',
      });
      return;
    }
    try {
      const url = await base44.connectors.connectAppUser(GOOGLE_CLASSROOM_CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          loadCourses();
        }
      }, 500);
    } catch (e) {
      toast({ title: 'Could not start Google Classroom sign-in', description: e.message, variant: 'destructive' });
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!GOOGLE_CLASSROOM_CONNECTOR_ID) return;
    await base44.connectors.disconnectAppUser(GOOGLE_CLASSROOM_CONNECTOR_ID);
    setConnected(false);
    setCourses([]);
    setSelectedCourse(null);
    toast({ title: 'Disconnected from Google Classroom' });
  };

  const handlePostToClassroom = async () => {
    if (!selectedCourse || !application) return;
    setPosting(true);
    setStatusMsg('');
    try {
      const res = await base44.functions.invoke('googleClassroom', {
        action: 'postApplication',
        connectorId: GOOGLE_CLASSROOM_CONNECTOR_ID,
        courseId: selectedCourse.id,
        postType,
        title: title.trim() || application.title,
        description: description.trim(),
        applicationUrl: appUrl,
        maxPoints: postType === 'assignment' ? Number(maxPoints) || 100 : undefined,
      });
      if (res.data?.error) {
        throw new Error(res.data.error);
      }
      const link = res.data?.item?.alternateLink || selectedCourse.alternateLink || '';
      setPostedUrl(link);
      toast({
        title: `Added "${application.title}" to ${selectedCourse.name}`,
        description: postType === 'assignment' ? 'Posted as a Classroom Assignment.' : 'Posted as a Class Announcement.',
      });
    } catch (e) {
      setStatusMsg(e.message || 'Failed to post to Google Classroom.');
      toast({
        title: 'Could not post to Google Classroom',
        description: e.message || 'Please check your Google Classroom permissions.',
        variant: 'destructive',
      });
    } finally {
      setPosting(false);
    }
  };

  const handleQuickSharePopup = () => {
    const shareUrl = `https://classroom.google.com/share?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(
      title || application?.title || 'Application'
    )}&body=${encodeURIComponent(description || '')}`;
    window.open(shareUrl, 'google_classroom_share', 'width=640,height=720');
  };

  if (!application) return null;

  const isAuthorizedUser = canUseGoogleClassroom(authedUser || user);
  const filteredCourses = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.section?.toLowerCase().includes(q) ||
      c.descriptionHeading?.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] p-0 gap-0 border border-white/10 bg-[#0c0e16] text-white overflow-hidden flex flex-col rounded-2xl">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 pr-12 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg">Add to Google Classroom</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Assign or announce &ldquo;{application.title}&rdquo; directly to one of your Google Classroom classes.
              </DialogDescription>
            </div>
          </div>

          {connected && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {courses.length} class{courses.length === 1 ? '' : 'es'}
              </span>
              <button
                type="button"
                onClick={loadCourses}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Refresh classes"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!isAuthorizedUser ? (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/25 p-6 text-center space-y-2">
              <Lock className="h-7 w-7 text-rose-400 mx-auto" />
              <h3 className="text-sm font-semibold text-white">Restricted Feature</h3>
              <p className="text-xs text-slate-400">
                Google Classroom integration is restricted to {ALLOWED_CLASSROOM_EMAIL}.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              <span className="text-sm">Loading your Google Classroom classes...</span>
            </div>
          ) : !connected ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <GraduationCap className="h-6 w-6 text-emerald-300" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-semibold text-white">Sign in with Google & Approve Classroom Access</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect your Google Classroom account to view your active classes and post <strong className="text-white">{application.title}</strong> as an assignment or class announcement.
                  </p>
                </div>
                {statusMsg && (
                  <div className="max-w-md mx-auto rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-200">
                    {statusMsg}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={handleConnectGoogle}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
                  >
                    <GraduationCap className="h-4 w-4 mr-1.5" /> Sign in with Google & View Classes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleQuickSharePopup}
                    className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" /> Open Google Classroom Share Window
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Class Picker */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    1. Select a Google Classroom Class
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickSharePopup}
                    className="text-xs text-emerald-300 hover:underline inline-flex items-center gap-1"
                  >
                    Or share via Classroom popup <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {courses.length > 3 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search your classes..."
                      className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-xs"
                    />
                  </div>
                )}

                {filteredCourses.length === 0 ? (
                  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6 text-center text-xs text-slate-400">
                    No active Google Classroom classes found on this Google account.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {filteredCourses.map((c) => {
                      const active = selectedCourse?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCourse(c)}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            active
                              ? 'bg-emerald-500/15 border-emerald-400/50 text-white shadow-sm'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm truncate">{c.name}</span>
                            {active && <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            {c.section && <span>Section: {c.section}</span>}
                            {c.room && <span>· Room {c.room}</span>}
                            <span className="ml-auto text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {c.courseState || 'ACTIVE'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Post Configuration */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  2. Post Format & Details
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('assignment')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      postType === 'assignment'
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 text-emerald-300 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Classwork Assignment</div>
                      <div className="text-[10px] text-slate-400">Graded assignment with link attachment</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('announcement')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      postType === 'announcement'
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Megaphone className="h-4 w-4 text-emerald-300 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Class Stream Announcement</div>
                      <div className="text-[10px] text-slate-400">Post to the class stream with link</div>
                    </div>
                  </button>
                </div>

                {postType === 'assignment' && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs text-slate-400">Assignment Title</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Max Points</label>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        value={maxPoints}
                        onChange={(e) => setMaxPoints(e.target.value)}
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    {postType === 'assignment' ? 'Instructions for Students' : 'Announcement Text'}
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-white/5 border-white/10 text-white text-xs"
                  />
                </div>

                <div className="rounded-xl bg-slate-950/70 border border-white/5 px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 truncate">
                    Attached Link: <strong className="text-emerald-300 font-mono">{appUrl}</strong>
                  </span>
                </div>
              </div>

              {statusMsg && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-200">
                  {statusMsg}
                </div>
              )}

              {postedUrl && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center justify-between gap-3">
                  <div className="text-xs text-emerald-200">
                    ✓ Successfully added to <strong>{selectedCourse?.name}</strong>!
                  </div>
                  <a
                    href={postedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 shrink-0"
                  >
                    Open in Classroom <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                  Close
                </Button>
                <Button
                  type="button"
                  disabled={!selectedCourse || posting}
                  onClick={handlePostToClassroom}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
                >
                  {posting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Adding to Classroom...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1.5" /> Add to {selectedCourse ? selectedCourse.name : 'Google Classroom'}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}