import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Gavel, AlarmClock, Ban, Eye, Users } from 'lucide-react';
import { slaCounts } from '@/lib/appealSla';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Appeal.list('-created_date', 500),
      base44.entities.Moderation.list('-moderation_date', 500),
      base44.entities.WatchlistEntry.list('-created_date', 500),
      base44.entities.User.list(),
    ]).then(([appeals, mods, watch, users]) => {
      const open = (appeals || []).filter((a) => !a.removed && (a.status === 'Pending' || a.status === 'Under Review'));
      const dayAgo = Date.now() - 864e5;
      setStats([
        { label: 'Open appeals', value: open.length, icon: Gavel, cls: 'text-cyan-300' },
        { label: 'Overdue appeals', value: slaCounts(open).overdue, icon: AlarmClock, cls: 'text-rose-300' },
        { label: 'Bans (24h)', value: (mods || []).filter((m) => m.moderation_type?.includes('Ban') && new Date(m.moderation_date).getTime() > dayAgo).length, icon: Ban, cls: 'text-orange-300' },
        { label: 'Watchlisted', value: (watch || []).length, icon: Eye, cls: 'text-amber-300' },
        { label: 'Staff team', value: (users || []).filter((u) => u.role === 'admin' || u.role === 'staff').length, icon: Users, cls: 'text-violet-300' },
      ]);
    });
  }, []);

  if (!stats) return null;
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, cls }) => (
        <div key={label} className="rounded-2xl bg-amber-500/[0.04] border border-amber-500/15 p-4">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400"><Icon className={`h-3.5 w-3.5 ${cls}`} /> {label}</div>
          <div className={`mt-1 text-2xl font-bold ${cls}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}