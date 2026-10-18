import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search, FileSpreadsheet, CheckCircle2, ExternalLink, Unlink, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateSlug } from '@/lib/applicationSlug';
import { defaultSettings } from '@/lib/applicationTypes';

const CONNECTOR_ID = '6ad2dab80ca7f9b5339bb1ec';

export default function GoogleFormsSyncModal({ open, onClose, onSynced, onImportQuestions }) {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connMode, setConnMode] = useState('shared');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connError, setConnError] = useState('');
  const [directUrl, setDirectUrl] = useState('');

  // Rule 2: reusable fetch — doubles as connection check AND data loader
  const fetchForms = async (fromPopup = false) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('googleFormsSync', { action: 'list' });
      if (res.data?.apiError && res.data?.error) {
        setConnected(true);
        setConnError(res.data.error);
        setForms([]);
        return;
      }
      if (res.data?.error) throw new Error(res.data.error);
      setForms(res.data?.forms || []);
      setConnMode(res.data?.mode || 'shared');
      setConnected(true);
      setConnError('');
    } catch (e) {
      setConnected(false);
      setForms([]);
      if (fromPopup) {
        setConnError(
          'Google sign-in redirected back, but Base44 could not exchange the token. This happens when the Client Secret in your "Google Forms Sync" workspace connector does not match the Client ID in Google Cloud Console (make sure it is the GOCSPX-... secret value, with no extra spaces).'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Rule 1+2: check auth first, then fetch to detect connection status
  useEffect(() => {
    if (!open) return;
    setSelectedForm(null);
    setPreview(null);
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        await fetchForms();
      } else {
        setLoading(false);
      }
    });
  }, [open]);

  // Rule 3: open OAuth popup, poll for close, then re-fetch
  const handleConnect = async () => {
    setConnError('');
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          fetchForms(true);
        }
      }, 500);
    } catch (e) {
      toast({ title: 'Could not start Google connection', description: e.message, variant: 'destructive' });
    }
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setForms([]);
    setSelectedForm(null);
    setPreview(null);
    toast({ title: 'Disconnected from Google Forms' });
  };

  const handleSelectForm = async (f, usePublic = false) => {
    setSelectedForm(f);
    setLoadingPreview(true);
    setPreview(null);
    try {
      const res = await base44.functions.invoke(
        'googleFormsSync',
        usePublic ? { action: 'getPublic', formUrl: f.id } : { action: 'get', formId: f.id }
      );
      if (res.data?.error) throw new Error(res.data.error);
      setPreview(res.data.form);
    } catch (e) {
      toast({ title: 'Failed to load form questions', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSyncConfirm = async () => {
    if (!preview) return;
    if (onImportQuestions) {
      onImportQuestions(preview);
      toast({ title: `Imported ${preview.questions.length} questions from "${preview.title}"` });
      onClose();
      return;
    }
    setSyncing(true);
    try {
      let slug = generateSlug(preview.title || 'google-form');
      const existing = await base44.entities.Application.filter({ slug }, { limit: 5 });
      if ((existing?.items || []).length) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }
      await base44.entities.Application.create({
        title: preview.title || 'Untitled Google Form',
        description: preview.description || '',
        icon: '📝',
        status: 'draft',
        category: 'General',
        questions: JSON.stringify(preview.questions || []),
        settings: JSON.stringify(defaultSettings()),
        slug,
        created_by: user?.email || '',
      });
      toast({ title: `Synced "${preview.title}" (${preview.questions.length} questions)` });
      onSynced?.();
      onClose();
    } catch (e) {
      toast({ title: 'Failed to save synced application', description: e.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const filtered = forms.filter((f) => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 border border-white/10 bg-[#0c0e16] text-white overflow-hidden flex flex-col rounded-2xl">
        <div className="px-6 pt-5 pb-4 pr-12 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg">Sync from Google Forms</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Connect your Google account, pick any Google Form, and import all its questions automatically.
              </DialogDescription>
            </div>
          </div>
          {connected && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected ({forms.length} forms)
              </span>
              <button onClick={() => fetchForms(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" title="Refresh forms">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button onClick={handleDisconnect} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 border border-rose-500/20">
                <Unlink className="h-3.5 w-3.5" /> Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="text-sm">Checking Google Forms connection...</span>
            </div>
          ) : !user ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-slate-300">Sign in to your portal account to connect Google Forms.</p>
              <Button onClick={() => base44.auth.redirectToLogin()} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                Sign in
              </Button>
            </div>
          ) : !connected ? (
            <div className="space-y-4">
              {/* Instant import by link (no OAuth required) */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Quick Import by Google Form Link</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paste any public Google Form link (`docs.google.com/forms/...`) to import its questions immediately without connecting OAuth.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/.../viewform"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-xs"
                  />
                  <Button
                    type="button"
                    disabled={!directUrl.trim() || loadingPreview}
                    onClick={() => handleSelectForm({ id: directUrl.trim(), name: 'Linked Google Form' }, true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shrink-0"
                  >
                    {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load Form'}
                  </Button>
                </div>

                {preview && (
                  <div className="mt-3 rounded-xl bg-slate-900/70 border border-white/10 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{preview.title}</h4>
                        {preview.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{preview.description}</p>}
                      </div>
                      <span className="text-xs font-medium text-violet-300 shrink-0">
                        {preview.questions.length} question{preview.questions.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {preview.questions.map((q, i) => (
                        <div key={q.id} className="text-xs bg-slate-950/80 border border-white/5 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                          <span className="text-slate-200 truncate">{i + 1}. {q.text}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{q.type}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleSyncConfirm}
                      disabled={syncing || preview.questions.length === 0}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                    >
                      {syncing ? (
                        <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Syncing...</>
                      ) : (
                        <>{onImportQuestions ? 'Import Questions to Form' : 'Sync Form to Applications'} <ArrowRight className="h-4 w-4 ml-1.5" /></>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* OAuth account connection */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-6 w-6 text-violet-300" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-semibold text-white">Or browse all forms in your Google Account</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sign in with Google to list every form in your Google Drive.
                  </p>
                </div>
                {connError && (
                  <div className="max-w-lg mx-auto rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-200 text-left leading-relaxed">
                    {connError}
                  </div>
                )}
                <Button onClick={handleConnect} variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10 text-white px-5">
                  Sign in with Google & Allow Access
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {connError && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-200 leading-relaxed">
                  {connError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${forms.length} Google Forms...`}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-1.5">
                  <Input
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="Or paste Google Form link / ID..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-xs sm:w-56"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!directUrl.trim() || loadingPreview}
                    onClick={() => handleSelectForm({ id: directUrl.trim(), name: 'Linked Google Form' })}
                    className="bg-white/10 hover:bg-white/15 text-white border border-white/10 shrink-0"
                  >
                    Load
                  </Button>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-500">
                  {forms.length === 0 ? 'No Google Forms found in your Google Drive.' : 'No forms match your search.'}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {filtered.map((f) => {
                      const active = selectedForm?.id === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSelectForm(f)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            active
                              ? 'bg-violet-500/15 border-violet-400/50 text-white'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">{f.name || 'Untitled Form'}</span>
                            {active && <CheckCircle2 className="h-4 w-4 text-violet-300 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Modified {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'recently'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 flex flex-col justify-between min-h-[240px]">
                    {!selectedForm ? (
                      <div className="my-auto text-center text-xs text-slate-500">
                        Select a Google Form on the left to preview its questions and sync.
                      </div>
                    ) : loadingPreview ? (
                      <div className="my-auto flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                        <span className="text-xs">Fetching questions from Google Forms...</span>
                      </div>
                    ) : preview ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-white">{preview.title}</h4>
                            {selectedForm.webViewLink && (
                              <a href={selectedForm.webViewLink} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 hover:underline inline-flex items-center gap-1 shrink-0">
                                Open <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {preview.description && <p className="text-xs text-slate-400 line-clamp-2">{preview.description}</p>}
                          <div className="text-xs font-medium text-violet-300 pt-1">
                            {preview.questions.length} question{preview.questions.length === 1 ? '' : 's'} detected:
                          </div>
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {preview.questions.map((q, i) => (
                              <div key={q.id} className="text-xs bg-slate-900/80 border border-white/5 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                                <span className="text-slate-200 truncate">{i + 1}. {q.text}</span>
                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{q.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={handleSyncConfirm}
                          disabled={syncing || preview.questions.length === 0}
                          className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                        >
                          {syncing ? (
                            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Syncing...</>
                          ) : (
                            <>{onImportQuestions ? 'Import Questions to Form' : 'Sync Form to Applications'} <ArrowRight className="h-4 w-4 ml-1.5" /></>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="my-auto text-center text-xs text-rose-400">Could not load this form.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}