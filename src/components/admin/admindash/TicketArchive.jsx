import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { STATUS_STYLES } from '@/components/admin/appeals/appealMeta';
import TranscriptDialog from '@/components/admin/admindash/TranscriptDialog';

const FILTERS = ['All', 'Approved', 'Denied', 'Removed'];

export default function TicketArchive({ appeals }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);

  const closed = appeals.filter((a) => a.removed || a.status === 'Approved' || a.status === 'Denied');
  const shown = closed.filter((a) => {
    if (filter === 'Removed' ? !a.removed : filter !== 'All' && (a.removed || a.status !== filter)) return false;
    const s = q.toLowerCase();
    return !s || [a.roblox_username, a.assigned_to, a.appeal_reason].some((v) => v?.toLowerCase().includes(s));
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search player, staff or reason…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-900/60 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-xs font-medium ${filter === f ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">{shown.length} ticket{shown.length === 1 ? '' : 's'}</p>
      {shown.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">No tickets match.</div>
      ) : (
        <div className="rounded-xl border border-white/10 divide-y divide-white/5 max-h-[520px] overflow-y-auto">
          {shown.map((a) => (
            <button key={a.id} onClick={() => setOpen(a)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04]">
              <FileText className="h-4 w-4 text-slate-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{a.roblox_username}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${a.removed ? 'border-white/15 text-slate-400' : STATUS_STYLES[a.status] || ''}`}>{a.removed ? 'Removed' : a.status}</span>
                  <span className="text-[11px] text-slate-500">{a.assigned_to ? `by ${a.assigned_to}` : 'unassigned'}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{a.appeal_reason}</p>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">{new Date(a.updated_date).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      )}
      <TranscriptDialog appeal={open} onClose={() => setOpen(null)} />
    </div>
  );
}