import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Trophy } from 'lucide-react';
import { buildStaffStats, formatHours } from '@/lib/staffStats';
import CustomDropdown from '@/components/ui/custom-dropdown';

const RANGES = [{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: 'all', label: 'All time' }];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function StaffPerformanceTab() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('30');

  useEffect(() => {
    Promise.all([
      base44.entities.StaffLog.list('-created_date', 2000),
      base44.entities.Appeal.list('-created_date', 1000),
    ]).then(([logs, appeals]) => setData({ logs: logs || [], appeals: appeals || [] }));
  }, []);

  if (!data) return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 864e5;
  const inRange = (d) => new Date(d).getTime() >= cutoff;
  const rows = buildStaffStats(data.logs.filter((l) => inRange(l.created_date)), data.appeals.filter((a) => inRange(a.created_date)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Staff performance</h2>
        <div className="ml-auto w-40"><CustomDropdown value={range} onChange={setRange} options={RANGES} /></div>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-12 text-center text-sm text-slate-400">No staff activity in this period.</div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wide">
                {['Staff', 'Decisions', 'Approved', 'Denied', 'Mods issued', 'Edits', 'Assigned', 'Avg resolve', 'Last active'].map((h) => (
                  <th key={h} className="text-left font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{MEDALS[i] || ''} {r.name}</td>
                  <td className="px-4 py-3 text-cyan-300 font-semibold">{r.decisions}</td>
                  <td className="px-4 py-3 text-emerald-300">{r.approved}</td>
                  <td className="px-4 py-3 text-rose-300">{r.denied}</td>
                  <td className="px-4 py-3 text-slate-200">{r.issued}</td>
                  <td className="px-4 py-3 text-slate-400">{r.edits}</td>
                  <td className="px-4 py-3 text-slate-200">{r.resolved}/{r.assigned}</td>
                  <td className="px-4 py-3 text-slate-200">{formatHours(r.avgHours)}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.lastActive ? new Date(r.lastActive).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500">"Assigned" shows resolved / total appeals assigned. "Avg resolve" is the average time from submission to final decision on assigned appeals.</p>
    </div>
  );
}