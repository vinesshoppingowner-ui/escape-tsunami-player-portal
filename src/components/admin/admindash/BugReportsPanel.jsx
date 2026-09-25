import { base44 } from '@/api/base44Client';

const SEV = { Low: 'text-slate-300', Medium: 'text-amber-300', High: 'text-orange-300', Critical: 'text-rose-300' };
const STATUSES = ['Submitted', 'Confirmed', 'Declined'];

export default function BugReportsPanel({ bugs, onChanged }) {
  const setStatus = async (id, status) => {
    await base44.entities.BugReport.update(id, { status });
    onChanged();
  };

  if (!bugs.length) return <div className="py-10 text-center text-sm text-slate-500">No bug reports.</div>;

  return (
    <div className="rounded-xl border border-white/10 divide-y divide-white/5 max-h-[520px] overflow-y-auto">
      {bugs.map((b) => (
        <div key={b.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{b.title}</span>
            <span className={`text-[11px] ${SEV[b.severity] || ''}`}>{b.severity}</span>
            <span className="text-[11px] text-slate-500">by {b.roblox_username} · {new Date(b.created_date).toLocaleDateString()}</span>
            <div className="ml-auto flex gap-1">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatus(b.id, s)} className={`px-2 py-0.5 rounded-md text-[11px] border ${b.status === s ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' : 'border-white/10 text-slate-400 hover:text-white'}`}>{s}</button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400 whitespace-pre-wrap">{b.description}</p>
        </div>
      ))}
    </div>
  );
}