import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, FileText, Pencil, Trash2, Users, ChevronLeft, Link2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ApplicationEditor from './applications/ApplicationEditor';
import ResponsesBoard from './applications/ResponsesBoard';

const STATUS_STYLES = {
  draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  open: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  closed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const RESPONSE_STATUS_STYLES = {
  submitted: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  under_review: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  accepted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export default function ApplicationsTab() {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [viewingResponse, setViewingResponse] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const apps = await base44.entities.Application.list('-created_date', 200);
      setApplications(apps || []);
    } catch {
      toast({ title: 'Failed to load applications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadResponses = async (app) => {
    setLoadingResponses(true);
    try {
      const res = await base44.entities.ApplicationResponse.filter({ application_id: app.id }, '-created_date', 500);
      setResponses(res || []);
    } catch {
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const openResponses = (app) => setViewingApp(app);

  const openEditor = (app = null) => {
    setEditingApp(app);
    setEditorOpen(true);
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

  const filtered = applications.filter((a) => a.title?.toLowerCase().includes(search.toLowerCase()));

  if (viewingApp) return <ResponsesBoard app={viewingApp} onBack={() => { setViewingApp(null); load(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applications..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 max-w-xs" />
        <Button size="sm" onClick={() => openEditor(null)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
          <Plus className="h-4 w-4 mr-1" /> Create Application
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 py-12 text-center">
          <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{search ? 'No applications found.' : 'No applications yet. Create one to get started.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => (
            <div key={app.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center gap-4">
              <span className="text-2xl shrink-0">{app.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">{app.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[app.status] || STATUS_STYLES.draft}`}>{app.status}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{app.description || 'No description'}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {JSON.parse(app.questions || '[]').length} questions</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {app.response_count || 0} responses</span>
                  <span>{app.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/apply/${app.id}`); toast({ title: 'Application link copied' }); }} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white" title="Copy application link"><Link2 className="h-4 w-4" /></button>
                <button onClick={() => openResponses(app)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white" title="View responses"><Users className="h-4 w-4" /></button>
                <button onClick={() => openEditor(app)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white" title="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setConfirmDelete(app)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApplicationEditor open={editorOpen} onClose={() => setEditorOpen(false)} application={editingApp} onSave={load} />

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setConfirmDelete(null)}>
          <div className="max-w-sm w-full rounded-2xl bg-slate-900 border border-white/10 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6 text-rose-400" />
            </div>
            <h3 className="font-semibold text-white">Delete application?</h3>
            <p className="text-sm text-slate-400 mt-1">This will permanently delete "{confirmDelete.title}" and all {confirmDelete.response_count || 0} responses. This cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1 text-slate-300">Cancel</Button>
              <Button size="sm" onClick={handleDelete} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white border-0">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}