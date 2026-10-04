import { ShieldBan, AlertTriangle, Activity, Layers } from 'lucide-react';

export default function QuickStats({ list }) {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const activeBans = list.filter((m) => m.status === 'Active' && m.moderation_type.includes('Ban')).length;
  const totalWarnings = list.filter((m) => m.moderation_type === 'Warning').length;
  const last24h = list.filter((m) => {
    const d = m.moderation_date ? new Date(m.moderation_date).getTime() : 0;
    return d >= dayAgo;
  }).length;
  const total = list.length;

  const stats = [
    { label: 'Active Bans', value: activeBans, icon: ShieldBan, cls: 'text-rose-300' },
    { label: 'Warnings', value: totalWarnings, icon: AlertTriangle, cls: 'text-amber-300' },
    { label: 'Actions · 24h', value: last24h, icon: Activity, cls: 'text-cyan-300' },
    { label: 'Total Records', value: total, icon: Layers, cls: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-xl overflow-hidden mb-5 border border-white/[0.06]">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-[#0B0D13] p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
              <Icon className={`h-4 w-4 ${s.cls}`} />
            </div>
            <div className="min-w-0">
              <div className={`text-2xl font-bold leading-tight ${s.cls}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate">{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}