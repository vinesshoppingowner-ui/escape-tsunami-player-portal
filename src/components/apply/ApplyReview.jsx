import { Pencil, Star } from 'lucide-react';
import UploadedFileAttachment from '@/components/apply/UploadedFileAttachment';

export function formatAnswer(q, a) {
  if (a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0)) return null;
  if (q.type === 'yesno') return a ? 'Yes' : 'No';
  if (q.type === 'checkbox') return a.join(', ');
  if (q.type === 'rating') return `${a} / 5`;
  if (q.type === 'file' && typeof a === 'string' && a.startsWith('file:')) {
    const [, filename] = a.split('|');
    return filename || 'Uploaded file';
  }
  return String(a);
}

export default function ApplyReview({ questions, answers, onEdit }) {
  return (
    <div className="space-y-2">
      {questions.map((q, i) => {
        const val = formatAnswer(q, answers[q.id]);
        return (
          <button type="button" key={q.id} onClick={() => onEdit(i)} className="w-full text-left rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 p-4 flex items-start gap-3 transition-colors group">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-semibold shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400">{q.text}{q.required && <span className="text-rose-400 ml-1">*</span>}</div>
              {val === null ? (
                <div className={`mt-0.5 text-sm italic ${q.required ? 'text-rose-300' : 'text-slate-500'}`}>{q.required ? 'Required — not answered' : 'Skipped'}</div>
              ) : q.type === 'rating' ? (
                <div className="mt-1 flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${answers[q.id] >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />)}</div>
              ) : q.type === 'file' && typeof answers[q.id] === 'string' && answers[q.id].startsWith('file:') ? (
                <div className="mt-1.5"><UploadedFileAttachment value={answers[q.id]} compact /></div>
              ) : q.type === 'code' ? (
                <pre className="mt-0.5 text-sm text-emerald-300 bg-slate-950/60 border border-white/5 rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap break-words">{val}</pre>
              ) : (
                <div className="mt-0.5 text-sm text-white whitespace-pre-wrap break-words">{val}</div>
              )}
            </div>
            <Pencil className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 shrink-0 mt-0.5" />
          </button>
        );
      })}
    </div>
  );
}