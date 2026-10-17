import { useState } from 'react';
import { Copy, Check, Clock, FileText } from 'lucide-react';
import { formatAnswer } from '@/lib/applicationTypes';

export default function ResponseAnswers({ questions, answers }) {
  const [onlyRequired, setOnlyRequired] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalWords = questions.reduce((sum, q) => {
    const a = formatAnswer(q, answers[q.id]);
    return sum + (a ? a.split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  const readMins = Math.max(1, Math.ceil(totalWords / 200));

  const copyAll = () => {
    const text = questions
      .map((q, i) => `Q${i + 1}: ${q.text}\nA: ${formatAnswer(q, answers[q.id]) || '(No answer)'}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const visible = onlyRequired ? questions.filter((q) => q.required) : questions;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-cyan-400" /> {totalWords} total words</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-violet-400" /> ~{readMins} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyRequired((r) => !r)}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
              onlyRequired ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {onlyRequired ? 'Showing required only' : 'All questions'}
          </button>
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy all'}
          </button>
        </div>
      </div>

      {visible.map((q, i) => {
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