import { Bug, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function BugReportStats({ reports }) {
  const total = reports.length;
  const submitted = reports.filter((r) => r.status === 'Submitted').length;
  const confirmed = reports.filter((r) => r.status === 'Confirmed').length;
  const critical = reports.filter((r) => r.severity === 'Critical').length;

  const stats = [
    { label: 'Total reports', value: total, icon: Bug, color: 'text-cyan-400' },
    { label: 'Awaiting review', value: submitted, icon: Clock, color: 'text-amber-400' },
    { label: 'Confirmed', value: confirmed, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Critical', value: critical, icon: AlertTriangle, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{s.label}</span>
          </div>
          <span className="text-2xl font-bold text-white">{s.value}</span>
        </div>
      ))}
    </div>
  );
}