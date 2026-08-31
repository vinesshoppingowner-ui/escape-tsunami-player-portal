import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

const SEVERITY = {
  Warning: 1,
  Mute: 2,
  Kick: 3,
  'Temporary Ban': 4,
  'Permanent Ban': 5,
};

export default function AccountStanding({ moderations = [] }) {
  const active = moderations.filter((m) => m.status === 'Active');
  const score = active.reduce((s, m) => s + (SEVERITY[m.moderation_type] || 1), 0);
  const hasPerm = active.some((m) => m.moderation_type === 'Permanent Ban');

  let level, color, Icon, pct;
  if (score === 0) {
    level = 'Good Standing';
    color = 'emerald';
    Icon = ShieldCheck;
    pct = 100;
  } else if (hasPerm || score >= 4) {
    level = 'At Risk';
    color = 'rose';
    Icon = ShieldAlert;
    pct = 15;
  } else {
    level = 'Warning';
    color = 'amber';
    Icon = AlertTriangle;
    pct = 60;
  }

  const markerLeft = 100 - pct;
  const badgeCls = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }[color];
  const iconCls = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  }[color];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-5 w-5 ${iconCls}`} />
          <div>
            <div className="text-sm font-semibold text-white">Account Standing</div>
            <div className="text-xs text-slate-500">
              {active.length === 0 ? 'No active moderations' : `${active.length} active moderation${active.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badgeCls}`}>{level}</span>
      </div>

      <div className="mt-4 relative h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-slate-950 shadow-lg transition-all duration-500"
          style={{ left: `${markerLeft}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
        <span>Good</span>
        <span>Warning</span>
        <span>At Risk</span>
      </div>
    </div>
  );
}