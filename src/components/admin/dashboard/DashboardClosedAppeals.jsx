import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Archive, Loader2 } from 'lucide-react';
import ClosedAppealItem from '@/components/admin/dashboard/ClosedAppealItem';

const VIEWS = [
  { key: 'closed', label: 'Closed' },
  { key: 'removed', label: 'Removed' },
];

export default function DashboardClosedAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('closed');

  const load = async () => {
    const list = await base44.entities.Appeal.list('-updated_date', 200);
    setAppeals(list || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const closed = appeals.filter((a) => !a.removed && (a.status === 'Approved' || a.status === 'Denied'));
  const removed = appeals.filter((a) => a.removed);
  const shown = view === 'closed' ? closed : removed;
  const counts = { closed: closed.length, removed: removed.length };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <Archive className="h-4 w-4 text-cyan-300" />
        <h3 className="font-semibold text-white">Closed & removed appeals</h3>
        <div className="ml-auto flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === v.key ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'}`}
            >
              {v.label} ({counts[v.key]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-400 text-sm"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…</div>
      ) : shown.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">No {view} appeals.</div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {shown.map((a) => <ClosedAppealItem key={a.id} appeal={a} onChanged={load} />)}
        </div>
      )}
    </div>
  );
}