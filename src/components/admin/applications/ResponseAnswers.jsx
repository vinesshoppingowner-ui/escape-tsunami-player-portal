import { formatAnswer } from '@/lib/applicationTypes';

export default function ResponseAnswers({ questions, answers }) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const a = formatAnswer(q, answers[q.id]);
        return (
          <div key={q.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <div className="flex items-start gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300 text-[11px] font-bold shrink-0">{i + 1}</span>
              <div className="text-sm text-slate-300 font-medium leading-snug">{q.text}{q.required && <span className="text-rose-400 ml-0.5">*</span>}</div>
            </div>
            {a ? (
              <div className="text-sm text-white whitespace-pre-wrap leading-relaxed pl-8">{a}</div>
            ) : (
              <div className="text-sm text-slate-600 italic pl-8">No answer</div>
            )}
            {a && q.type === 'textarea' && <div className="pl-8 mt-1.5 text-[10px] text-slate-600">{a.split(/\s+/).filter(Boolean).length} words</div>}
          </div>
        );
      })}
    </div>
  );
}