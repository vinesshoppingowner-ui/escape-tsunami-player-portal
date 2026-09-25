import { Sparkles } from 'lucide-react';

const tone = (s) => (s >= 75 ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : s >= 45 ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10');

export default function AIScoreBadge({ score }) {
  if (score === undefined || score === null) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md border ${tone(score)}`} title="AI score">
      <Sparkles className="h-3 w-3" /> {score}
    </span>
  );
}