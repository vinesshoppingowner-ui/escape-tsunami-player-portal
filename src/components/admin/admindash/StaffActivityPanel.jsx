import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import StaffDetailDialog from '@/components/admin/admindash/StaffDetailDialog';

export default function StaffActivityPanel({ logs, appeals }) {
  const [open, setOpen] = useState(null);

  const map = {};
  logs.forEach((l) => {
    const s = (map[l.staff_username] ||= { name: l.staff_username, logs: [], decisions: 0, approved: 0, denied: 0, mods: 0, assigned: 0, last: l.created_date });
    s.logs.push(l);
    if (l.action === 'appeal_decision') {
      s.decisions += 1;
      if (l.detail?.includes('Approved')) s.approved += 1;
      if (l.detail?.includes('Denied')) s.denied += 1;
    }
    if (l.action === 'moderation_issued') s.mods += 1;
  });
  appeals.forEach((a) => {
    if (a.assigned_to && map[a.assigned_to] && (a.status === 'Pending' || a.status === 'Under Review')) map[a.assigned_to].assigned += 1;
  });
  const staff = Object.values(map).sort((a, b) => b.logs.length - a.logs.length);

  if (!staff.length) return <div className="py-10 text-center text-sm text-slate-500">No staff activity recorded yet.</div>;

  return (
    <>
      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-slate-500 bg-white/[0.03]">
            <tr>{['Staff', 'Appeals decided', 'Approved', 'Denied', 'Moderations', 'Open queue', 'Last active', ''].map((h) => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {staff.map((s) => (
              <tr key={s.name} onClick={() => setOpen(s)} className="cursor-pointer hover:bg-white/[0.04]">
                <td className="px-3 py-2.5 font-medium">{s.name}</td>
                <td className="px-3 py-2.5">{s.decisions}</td>
                <td className="px-3 py-2.5 text-emerald-300">{s.approved}</td>
                <td className="px-3 py-2.5 text-rose-300">{s.denied}</td>
                <td className="px-3 py-2.5">{s.mods}</td>
                <td className="px-3 py-2.5">{s.assigned}</td>
                <td className="px-3 py-2.5 text-slate-400 text-xs">{new Date(s.last).toLocaleDateString()}</td>
                <td className="px-3 py-2.5 text-slate-500"><ChevronRight className="h-4 w-4" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StaffDetailDialog staff={open} onClose={() => setOpen(null)} />
    </>
  );
}