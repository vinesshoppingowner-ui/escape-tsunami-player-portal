function Breakdown({ title, counts }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map((e) => e[1]));
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {entries.length === 0 ? <p className="text-sm text-slate-500">Nothing in this period.</p> : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <div className="flex justify-between text-slate-300"><span className="truncate">{k}</span><span>{v}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-cyan-500/70" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const countBy = (rows, fn) => rows.reduce((acc, r) => { const k = fn(r) || 'Unknown'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});

export default function ReportSummary({ mods, appeals, logs }) {
  const decided = appeals.filter((a) => ['Approved', 'Denied'].includes(a.status));
  const approvalRate = decided.length ? Math.round((decided.filter((a) => a.status === 'Approved').length / decided.length) * 100) : 0;
  const stats = [
    ['Moderations', mods.length],
    ['Appeals', appeals.length],
    ['Approval rate', `${approvalRate}%`],
    ['Staff actions', logs.length],
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-2xl font-bold">{v}</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Breakdown title="Moderations by type" counts={countBy(mods, (m) => m.moderation_type)} />
        <Breakdown title="Appeals by status" counts={countBy(appeals, (a) => a.status)} />
        <Breakdown title="Most active staff" counts={countBy(logs, (l) => l.staff_username)} />
      </div>
    </div>
  );
}