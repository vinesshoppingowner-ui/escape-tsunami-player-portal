import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppIcon from '@/components/apply/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Users,
  Link2,
  ShieldBan,
  FileSpreadsheet,
  Sparkles,
  Settings,
  Copy,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ApplicationEditor from './applications/ApplicationEditor';
import ResponsesBoard from './applications/ResponsesBoard';
import ApplicationBlacklistPanel from './applications/ApplicationBlacklistPanel';
import GoogleFormsSyncModal from './applications/GoogleFormsSyncModal';
import ApplicationSyncModal from './applications/ApplicationSyncModal';
import GoogleSheetSyncSettings from './applications/GoogleSheetSyncSettings';
import { safeParse } from '@/lib/safeParse';
import { defaultSettings } from '@/lib/applicationTypes';
import { generateSlug } from '@/lib/applicationSlug';
import { useLiveApplicationResponses } from '@/hooks/useLiveApplications';

const STATUS_STYLES = {
  draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  open: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  closed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function getSettingBadges(app) {
  const s = { ...defaultSettings(), ...safeParse(app.settings, {}) };
  const badges = [];
  if (s.requireRobloxVerification) badges.push('Roblox Verified');
  if (s.oneResponsePerUser) badges.push('1 Response Limit');
  if (s.allowEditing) badges.push('Editable');
  if (s.allowRetake) badges.push(`Retakes (${s.retakeCooldownDays || 0}d)`);
  if (s.aiReviewEnabled) badges.push('AI Screening');
  if (s.restrictToUsers) badges.push(`Invite Only (${(s.allowedUsers || []).length})`);
  if (s.responseLimit > 0) badges.push(`Max ${s.responseLimit}`);
  if (s.minAccountAgeDays > 0) badges.push(`${s.minAccountAgeDays}d Min Age`);
  if (s.blockCopyPaste) badges.push('Copy Protected');
  if (s.discordAlert !== false) badges.push('Discord Alert');
  if (app.auto_close_at) badges.push(`Closes ${new Date(app.auto_close_at).toLocaleDateString()}`);
  return badges;
}

export default function ApplicationsTab() {
  const { toast } = useToast();
  const { countsByApp, newCountsByApp, totalCount, unreviewedCount } = useLiveApplicationResponses(true);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('questions');
  const [editingApp, setEditingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [blacklistOpen, setBlacklistOpen] = useState(false);
  const [googleSyncOpen, setGoogleSyncOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [sheetSyncOpen, setSheetSyncOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Application.filter({}, { sort: '-created_date', limit: 200 });
      setApplications(page?.items || []);
    } catch {
      toast({ title: 'Failed to load applications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Application.subscribe((event) => {
      if (!event?.data && event?.type !== 'delete') return;
      setApplications((prev) => {
        if (event.type === 'create' && event.data) {
          if (prev.some((a) => a.id === event.data.id)) return prev;
          return [event.data, ...prev];
        }
        if (event.type === 'update' && event.data) {
          return prev.map((a) => (a.id === event.data.id ? event.data : a));
        }
        if (event.type === 'delete') {
          return prev.filter((a) => a.id !== event.id);
        }
        return prev;
      });
    });
    return () => unsubscribe?.();
  }, []);

  const openEditor = (app = null, tab = 'questions') => {
    setEditingApp(app);
    setEditorTab(tab);
    setEditorOpen(true);
  };

  const handleQuickStatus = async (app, nextStatus) => {
    if (app.status === nextStatus) return;
    try {
      const updated = await base44.entities.Application.update(app.id, { status: nextStatus });
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, ...updated } : a)));
      toast({ title: `"${app.title}" set to ${nextStatus}` });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (app) => {
    try {
      const copyTitle = `${app.title} (Copy)`;
      const slug = `${generateSlug(copyTitle)}-${Math.random().toString(36).slice(2, 6)}`;
      await base44.entities.Application.create({
        title: copyTitle,
        description: app.description || '',
        status: 'draft',
        category: app.category || 'General',
        icon: app.icon || '📋',
        slug,
        success_message: app.success_message || '',
        auto_close_at: app.auto_close_at || null,
        questions: app.questions || '[]',
        settings: app.settings || JSON.stringify(defaultSettings()),
      });
      toast({ title: `Duplicated "${app.title}"` });
      load();
    } catch {
      toast({ title: 'Failed to duplicate application', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await base44.entities.ApplicationResponse.deleteMany({ application_id: confirmDelete.id });
      await base44.entities.Application.delete(confirmDelete.id);
      toast({ title: 'Application deleted' });
      setConfirmDelete(null);
      load();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const filtered = applications.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.slug?.toLowerCase().includes(q)
    );
  });

  if (viewingApp) {
    const freshViewing = applications.find((a) => a.id === viewingApp.id) || viewingApp;
    return <ResponsesBoard app={freshViewing} onBack={() => { setViewingApp(null); load(); }} />;
  }

  const openCount = applications.filter((a) => a.status === 'open').length;
  const draftCount = applications.filter((a) => a.status === 'draft').length;
  const closedCount = applications.filter((a) => a.status === 'closed').length;

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Forms</div>
          <div className="text-xl font-bold text-white mt-0.5">{applications.length}</div>
        </div>
        <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wider text-emerald-300/80">Open Forms</div>
          <div className="text-xl font-bold text-emerald-300 mt-0.5">{openCount}</div>
        </div>
        <div className="rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wider text-cyan-300/80">Total Submissions</div>
          <div className="text-xl font-bold text-cyan-300 mt-0.5">{totalCount}</div>
        </div>
        <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/20 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wider text-amber-300/80">Awaiting Review</div>
          <div className="text-xl font-bold text-amber-300 mt-0.5">{unreviewedCount}</div>
        </div>
      </div>

      {/* Controls & actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 max-w-xs"
          />
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10">
            {[
              ['all', `All (${applications.length})`],
              ['open', `Open (${openCount})`],
              ['draft', `Draft (${draftCount})`],
              ['closed', `Closed (${closedCount})`],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === k ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setBlacklistOpen(true)}
            className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20"
          >
            <ShieldBan className="h-4 w-4 mr-1" /> Blacklist
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSyncModalOpen(true)}
            className="text-cyan-200 hover:text-white hover:bg-cyan-500/15 border border-cyan-500/30 bg-cyan-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Sync Apps
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setGoogleSyncOpen(true)}
            className="text-violet-200 hover:text-white hover:bg-violet-500/15 border border-violet-500/30 bg-violet-500/10"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Sync from Google Forms
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSheetSyncOpen(true)}
            className="text-emerald-200 hover:text-white hover:bg-emerald-500/15 border border-emerald-500/30 bg-emerald-500/10"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Sheet Sync
          </Button>
          <Button
            size="sm"
            onClick={() => openEditor(null, 'questions')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Create Application
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 py-12 text-center">
          <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            {search || statusFilter !== 'all' ? 'No applications match your filter.' : 'No applications yet. Create one to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((app) => {
            const totalForApp = countsByApp[app.id] ?? app.response_count ?? 0;
            const newForApp = newCountsByApp[app.id] || 0;
            const qCount = safeParse(app.questions, []).length;
            const settingBadges = getSettingBadges(app);

            return (
              <div
                key={app.id}
                onClick={() => setViewingApp(app)}
                className="cursor-pointer rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <AppIcon icon={app.icon} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white truncate">{app.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_STYLES[app.status] || STATUS_STYLES.draft}`}>
                        {app.status}
                      </span>
                      {newForApp > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse shrink-0">
                          <Sparkles className="h-2.5 w-2.5" /> {newForApp} New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{app.description || 'No description'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {qCount} question{qCount === 1 ? '' : 's'}
                      </span>
                      <span className={`flex items-center gap-1 ${totalForApp > 0 ? 'text-cyan-300 font-medium' : ''}`}>
                        <Users className="h-3 w-3" /> {totalForApp} response{totalForApp === 1 ? '' : 's'}
                      </span>
                      <span>{app.category || 'General'}</span>
                      {app.slug && <span className="text-slate-600 font-mono">/apply/{app.slug}</span>}
                    </div>
                    {settingBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {settingBadges.map((b) => (
                          <span
                            key={b}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status || 'draft'}
                    onChange={(e) => handleQuickStatus(app, e.target.value)}
                    aria-label={`Status for ${app.title}`}
                    className="h-8 rounded-lg bg-slate-900 border border-white/10 px-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  >
                    <option value="open">Open</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/apply/${app.slug || app.id}`);
                      toast({ title: 'Application link copied' });
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                    title="Copy application link"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <a
                    href={`/apply/${app.slug || app.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                    title="Preview live form"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => setViewingApp(app)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white inline-flex items-center gap-1"
                    title="View responses"
                  >
                    <Users className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Responses</span>
                  </button>
                  <button
                    onClick={() => openEditor(app, 'questions')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white inline-flex items-center gap-1"
                    title="Edit questions"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-300" />
                    <span>Questions</span>
                  </button>
                  <button
                    onClick={() => openEditor(app, 'settings')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white inline-flex items-center gap-1"
                    title="Form settings"
                  >
                    <Settings className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => handleDuplicate(app)}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                    title="Duplicate form & settings"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(app)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ApplicationEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        application={editingApp}
        initialTab={editorTab}
        onSave={load}
      />

      <GoogleFormsSyncModal open={googleSyncOpen} onClose={() => setGoogleSyncOpen(false)} onSynced={load} />

      <GoogleSheetSyncSettings open={sheetSyncOpen} onClose={() => setSheetSyncOpen(false)} />

      <ApplicationSyncModal
        open={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        applications={applications}
        onSynced={load}
      />

      {blacklistOpen && <ApplicationBlacklistPanel onClose={() => setBlacklistOpen(false)} />}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="max-w-sm w-full rounded-2xl bg-slate-900 border border-white/10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6 text-rose-400" />
            </div>
            <h3 className="font-semibold text-white">Delete application?</h3>
            <p className="text-sm text-slate-400 mt-1">
              This will permanently delete "{confirmDelete.title}" and all {countsByApp[confirmDelete.id] ?? confirmDelete.response_count ?? 0} responses. This cannot be undone.
            </p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1 text-slate-300">
                Cancel
              </Button>
              <Button size="sm" onClick={handleDelete} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white border-0">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}