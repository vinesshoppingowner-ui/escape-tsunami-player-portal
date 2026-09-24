import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { StickyNote, Loader2, Trash2, Plus } from 'lucide-react';

export default function PlayerNotesPanel({ username }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.PlayerNote.filter({ roblox_username: username }, '-created_date', 50).then((n) => setNotes(n || []));
  useEffect(() => { setNotes(null); load(); }, [username]);

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    await base44.entities.PlayerNote.create({ roblox_username: username, note: text.trim(), author: user?.full_name || user?.email });
    setText('');
    setSaving(false);
    load();
  };

  const remove = async (id) => {
    await base44.entities.PlayerNote.delete(id);
    load();
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
        <StickyNote className="h-4 w-4 text-amber-400" /> Staff notes on {username}
      </h3>
      <form onSubmit={add} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a private note…" className="flex-1 min-w-0 bg-slate-950/60 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50" />
        <button type="submit" disabled={saving || !text.trim()} className="px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 disabled:opacity-40">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
      </form>
      {notes === null ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-slate-500 py-1">No notes yet.</div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {notes.map((n) => (
            <div key={n.id} className="group rounded-lg bg-amber-500/[0.05] border border-amber-500/15 px-3 py-2 flex gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{n.note}</p>
                <div className="text-[11px] text-slate-500 mt-0.5">{n.author || 'Staff'} · {new Date(n.created_date).toLocaleString()}</div>
              </div>
              <button onClick={() => remove(n.id)} className="text-slate-500 hover:text-rose-300 opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}