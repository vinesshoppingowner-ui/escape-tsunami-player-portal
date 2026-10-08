import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Search, Plus, Pencil, Trash2, X, ChevronRight, FileText } from 'lucide-react';

const CATEGORIES = ['Moderation Guidance', 'Escalation', 'Appeals', 'Staff Procedures', 'Resources'];

export default function KnowledgeBaseTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = isOwner(user);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { items } = await base44.entities.KnowledgeBaseEntry.filter({}, { sort: 'category sort_order title', limit: 200 });
      setEntries(items);
    } catch {
      toast({ title: 'Failed to load knowledge base', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeCat !== 'All' && e.category !== activeCat) return false;
      if (!q) return true;
      return (e.title || '').toLowerCase().includes(q) || (e.summary || '').toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q);
    });
  }, [entries, query, activeCat]);

  const grouped = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      const c = e.category || 'Moderation Guidance';
      if (!map[c]) map[c] = [];
      map[c].push(e);
    }
    return map;
  }, [filtered]);

  function startCreate() {
    setEditing({ title: '', category: 'Moderation Guidance', summary: '', body: '', sort_order: 100 });
  }
  function startEdit(e) {
    setEditing({ ...e });
  }
  async function save() {
    if (!editing.title.trim() || !editing.body.trim()) {
      toast({ title: 'Title and body are required', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        title: editing.title.trim(),
        category: editing.category,
        summary: editing.summary?.trim() || '',
        body: editing.body,
        sort_order: Number(editing.sort_order) || 100,
        updated_by: user?.email || 'admin',
      };
      if (editing.id) {
        await base44.entities.KnowledgeBaseEntry.update(editing.id, payload);
        toast({ title: 'Entry updated' });
      } else {
        await base44.entities.KnowledgeBaseEntry.create(payload);
        toast({ title: 'Entry created' });
      }
      setEditing(null);
      await load();
    } catch {
      toast({ title: 'Failed to save entry', variant: 'destructive' });
    }
  }
  async function remove(e) {
    if (!confirm(`Delete "${e.title}"?`)) return;
    try {
      await base44.entities.KnowledgeBaseEntry.delete(e.id);
      toast({ title: 'Entry deleted' });
      if (selected?.id === e.id) setSelected(null);
      await load();
    } catch {
      toast({ title: 'Failed to delete entry', variant: 'destructive' });
    }
  }

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4 mt-4">
      {/* Sidebar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search handbook..."
            className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeCat === c ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {canManage && (
          <Button onClick={startCreate} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        )}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => {
            const list = grouped[cat] || [];
            if (!list.length) return null;
            return (
              <div key={cat}>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5 px-1">{cat}</div>
                <div className="space-y-1">
                  {list.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
                        selected?.id === e.id ? 'bg-white/[0.08] text-white' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-medium leading-tight">{e.title}</div>
                      {e.summary && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{e.summary}</div>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8">No entries found.</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {editing ? (
          <Editor entry={editing} setEntry={setEditing} onSave={save} onCancel={() => setEditing(null)} />
        ) : selected ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 mb-1">{selected.category}</div>
                <h2 className="font-display text-2xl font-bold text-white">{selected.title}</h2>
                {selected.summary && <p className="text-slate-400 mt-1">{selected.summary}</p>}
              </div>
              {canManage && (
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(selected)} className="h-8 w-8 text-slate-400 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(selected)} className="h-8 w-8 text-slate-400 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500">
            <BookOpen className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">Select an entry from the list to read the handbook.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Editor({ entry, setEntry, onSave, onCancel }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-white">{entry.id ? 'Edit Entry' : 'New Entry'}</h3>
        <Button size="icon" variant="ghost" onClick={onCancel} className="h-8 w-8 text-slate-400 hover:text-white"><X className="h-4 w-4" /></Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Title</label>
          <Input value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Category</label>
          <select
            value={entry.category}
            onChange={(e) => setEntry({ ...entry, category: e.target.value })}
            className="w-full h-9 rounded-md bg-white/[0.03] border border-white/10 text-white px-3 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1 block">Summary (optional)</label>
        <Input value={entry.summary || ''} onChange={(e) => setEntry({ ...entry, summary: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" placeholder="One-line summary shown in the list" />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1 block">Body</label>
        <Textarea value={entry.body} onChange={(e) => setEntry({ ...entry, body: e.target.value })} rows={14} className="bg-white/[0.03] border-white/10 text-white font-mono text-sm" placeholder="Write the full handbook entry..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="text-slate-300 hover:text-white">Cancel</Button>
        <Button onClick={onSave} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">{entry.id ? 'Save Changes' : 'Create Entry'}</Button>
      </div>
    </div>
  );
}