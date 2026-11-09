import { Check } from 'lucide-react';

const isEmpty = (a) => a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0);

export default function ApplyStepper({ questions, answers, step, onJump }) {
  const total = questions.length;
  return (
    <div className="mb-6 space-y-2.5">
      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        {questions.map((q, i) => {
          const done = q.type === 'section' ? i < step : !isEmpty(answers[q.id]);
          const active = i === step;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(i)}
              title={`Step ${i + 1}: ${q.text || 'Question'}`}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                active ? 'bg-cyan-400 h-2' : done ? 'bg-cyan-500/55' : 'bg-white/10 hover:bg-white/20'
              }`}
            />
          );
        })}
        <button
          type="button"
          onClick={() => onJump(total)}
          title="Review & Submit"
          className={`h-1.5 w-6 rounded-full transition-colors ${
            step >= total ? 'bg-emerald-400' : 'bg-white/10 hover:bg-white/20'
          }`}
        />
      </div>

      {/* Quick-jump numbered question pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {questions.map((q, i) => {
          const done = q.type === 'section' ? i < step : !isEmpty(answers[q.id]);
          const active = i === step;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(i)}
              title={q.text}
              className={`h-7 px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 transition-all ${
                active
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                  : done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                  : q.required
                  ? 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-amber-500/30'
                  : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {done && !active ? <Check className="h-3 w-3 text-emerald-400" /> : null}
              <span>{q.type === 'section' ? `Sec` : `Q${i + 1}`}</span>
              {!done && q.required && <span className="h-1.5 w-1.5 rounded-full bg-rose-400/80" />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onJump(total)}
          className={`h-7 px-2.5 rounded-lg border text-[11px] font-semibold shrink-0 transition-colors ${
            step >= total
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          Review
        </button>
      </div>
    </div>
  );
}