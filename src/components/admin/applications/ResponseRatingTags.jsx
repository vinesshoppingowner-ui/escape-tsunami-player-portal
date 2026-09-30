import { Star } from 'lucide-react';
import { RESPONSE_TAGS } from '@/lib/applicationTypes';

export default function ResponseRatingTags({ rating, setRating, tags, setTags }) {
  const toggle = (t) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Your rating</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)}>
              <Star className={`h-4 w-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {RESPONSE_TAGS.map((t) => (
          <button key={t} type="button" onClick={() => toggle(t)} className={`px-2 py-1 rounded-md text-[11px] border ${tags.includes(t) ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}