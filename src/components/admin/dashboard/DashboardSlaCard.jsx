import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlarmClock, CheckCircle2 } from 'lucide-react';
import { slaCounts } from '@/lib/appealSla';

export default function DashboardSlaCard() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    base44.entities.Appeal.list('-created_date', 500).then((a) => setCounts(slaCounts((a || []).filter((x) => !x.removed))));
  }, []);

  if (!counts) return null;
  const clear = !counts.overdue && !counts.warning;
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 ${clear ? 'bg-emerald-500/5 border-emerald-500/20' : counts.overdue ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
      {clear ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlarmClock className="h-5 w-5 text-rose-300" />}
      <div>
        <div className="text-sm font-semibold text-white">Appeal response times</div>
        <div className="text-xs text-slate-400">
          {clear ? 'Every open appeal is under 24 hours old.' : `${counts.overdue} overdue (48h+) · ${counts.warning} waiting 24h+`}
        </div>
      </div>
    </div>
  );
}