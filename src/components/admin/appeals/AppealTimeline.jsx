import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { History, Loader2 } from 'lucide-react';

export default function AppealTimeline({ appeal }) {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    base44.entities.StaffLog.filter({ target: appeal.roblox_username }, '-created_date', 50).then((l) =>
      setLogs((l || []).filter((x) => new Date(x.created_date) >= new Date(appeal.created_date)))
    );
  }, [appeal.id, appeal.updated_date]);

  const events = [
    { id: 'submitted', date: appeal.created_date, who: appeal.roblox_username, text: 'Appeal submitted', dot: 'bg-cyan-400' },
    ...(appeal.removed_at ? [{ id: 'removed', date: appeal.removed_at, who: appeal.removed_by, text: 'Appeal removed', dot: 'bg-rose-400' }] : []),
    ...(logs || []).map((l) => ({ id: l.id, date: l.created_date, who: l.staff_username, text: l.detail, dot: l.action === 'appeal_decision' ? 'bg-emerald-400' : 'bg-violet-400' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
        <History className="h-4 w-4 text-violet-400" /> Appeal timeline
      </h3>
      {logs === null ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="rounded-xl bg-slate-900/60 border border-white/10 p-3 max-h-56 overflow-y-auto">
          {events.map((e, i) => (
            <div key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`h-2.5 w-2.5 rounded-full mt-1.5 ${e.dot}`} />
                {i < events.length - 1 && <span className="w-px flex-1 bg-white/10" />}
              </div>
              <div className="pb-3 min-w-0">
                <div className="text-sm text-slate-200">{e.text}</div>
                <div className="text-[11px] text-slate-500">{e.who || 'Unknown'} · {new Date(e.date).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}