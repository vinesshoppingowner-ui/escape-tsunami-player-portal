import { AlarmClock } from 'lucide-react';
import { slaCounts, SLA_OVERDUE_HOURS, SLA_WARNING_HOURS } from '@/lib/appealSla';

export default function SlaBanner({ appeals }) {
  const { overdue, warning } = slaCounts(appeals);
  if (!overdue && !warning) return null;
  return (
    <div className={`rounded-xl border p-3 flex flex-wrap items-center gap-3 text-sm ${overdue ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'}`}>
      <AlarmClock className="h-4 w-4 shrink-0" />
      {overdue > 0 && <span><b>{overdue}</b> appeal{overdue > 1 ? 's' : ''} overdue (waiting {SLA_OVERDUE_HOURS}h+)</span>}
      {warning > 0 && <span className="text-amber-200"><b>{warning}</b> waiting over {SLA_WARNING_HOURS}h</span>}
    </div>
  );
}