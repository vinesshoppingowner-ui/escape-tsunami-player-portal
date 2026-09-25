import { Gavel, Clock, CheckCircle2, Shield, Ban, Users, Bug, BadgeCheck, Timer, Activity } from 'lucide-react';

const DAY = 86400000;

export default function AdminDashOverview({ data }) {
  const { appeals, mods, logs, bugs, verifs, users } = data;
  const live = appeals.filter((a) => !a.removed);
  const open = live.filter((a) => a.status === 'Pending' || a.status === 'Under Review');
  const closed = live.filter((a) => a.status === 'Approved' || a.status === 'Denied');
  const approved = closed.filter((a) => a.status === 'Approved').length;
  const avgHrs = closed.length
    ? Math.round(closed.reduce((s, a) => s + (new Date(a.updated_date) - new Date(a.created_date)), 0) / closed.length / 3600000)
    : 0;
  const week = Date.now() - 7 * DAY;

  const stats = [
    { icon: Gavel, label: 'Open tickets', value: open.length, tone: 'text-amber-300' },
    { icon: CheckCircle2, label: 'Closed tickets', value: closed.length, tone: 'text-emerald-300' },
    { icon: Activity, label: 'Approval rate', value: `${closed.length ? Math.round((approved / closed.length) * 100) : 0}%`, tone: 'text-cyan-300' },
    { icon: Timer, label: 'Avg. resolve time', value: `${avgHrs}h`, tone: 'text-violet-300' },
    { icon: Shield, label: 'Moderations (7d)', value: mods.filter((m) => new Date(m.created_date) >= week).length, tone: 'text-cyan-300' },
    { icon: Ban, label: 'Active bans', value: mods.filter((m) => m.status === 'Active' && m.moderation_type.includes('Ban')).length, tone: 'text-rose-300' },
    { icon: Clock, label: 'Staff actions (7d)', value: logs.filter((l) => new Date(l.created_date) >= week).length, tone: 'text-amber-300' },
    { icon: Users, label: 'Portal users', value: users.length, tone: 'text-slate-200' },
    { icon: Bug, label: 'Open bug reports', value: bugs.filter((b) => b.status === 'Submitted').length, tone: 'text-rose-300' },
    { icon: BadgeCheck, label: 'Pending verifications', value: verifs.filter((v) => v.status === 'pending').length, tone: 'text-emerald-300' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ icon: Icon, label, value, tone }) => (
        <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <Icon className={`h-4 w-4 ${tone}`} />
          <div className="mt-2 text-2xl font-bold">{value}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        </div>
      ))}
    </div>
  );
}