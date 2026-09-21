import { useEffect, useState } from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CurrentEvent() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    base44.entities.GameEvent.filter({ active: true }, '-created_date', 5).then((list) => {
      const now = Date.now();
      const live = (list || []).find((e) => !e.ends_at || new Date(e.ends_at).getTime() > now);
      setEvent(live || null);
    });
  }, []);

  if (!event) return null;

  const endsIn = event.ends_at ? Math.max(0, Math.ceil((new Date(event.ends_at) - Date.now()) / 86400000)) : null;

  return (
    <div className="mt-8 relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.10] via-orange-500/[0.06] to-transparent p-5">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-300">
            <Flame className="h-3.5 w-3.5" /> Current Event
          </div>
          <div className="mt-1.5 text-xl font-bold text-white flex items-center gap-2">
            <span>{event.emoji || '🌊'}</span> {event.title}
          </div>
          {event.description && <p className="mt-1 text-sm text-slate-300">{event.description}</p>}
          {endsIn !== null && <div className="mt-1.5 text-xs text-amber-200/70">{endsIn === 0 ? 'Ends today' : `Ends in ${endsIn} day${endsIn === 1 ? '' : 's'}`}</div>}
        </div>
        {event.cta_url && (
          <a href={event.cta_url} target={event.cta_url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium">
            {event.cta_label || 'View Event'} <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}