import { Pencil, Star, Bookmark, CheckCircle2, AlertTriangle } from 'lucide-react';
import UploadedFileAttachment from '@/components/apply/UploadedFileAttachment';

export function formatAnswer(q, a) {
  if (q?.type === 'section') return null;
  if (a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0)) return null;
  if (q.type === 'yesno') return a ? 'Yes' : 'No';
  if (q.type === 'checkbox') return a.join(', ');
  if (q.type === 'rating') return `${a} / 5`;
  if (q.type === 'scale') return `${a} / ${q.scaleMax || 10}`;
  if (q.type === 'slider') return `${a} ${q.sliderUnit || ''}`.trim();
  if ((q.type === 'file' || q.type === 'screenshot') && typeof a === 'string' && a.startsWith('file:')) {
    return a.split('\n').filter((s) => s.startsWith('file:')).map((s) => s.split('|')[1] || 'Uploaded file').join(', ');
  }
  return String(a);
}

export default function ApplyReview({ questions, answers, bookmarks = {}, onEdit }) {
  const answerable = questions.filter((q) => q.type !== 'section');
  const missingRequired = answerable.filter((q) => q.required && formatAnswer(q, answers[q.id]) === null);
  const shortOpen = answerable.filter((q) => {
    if (q.type !== 'textarea') return false;
    const v = formatAnswer(q, answers[q.id]);
    return v && v.trim().split(/\s+/).length < 8;
  });
  const bookmarkedCount = answerable.filter((q) => bookmarks[q.id]).length;

  return (
    <div className="space-y-3">
      {/* Submission Readiness Check */}
      <div className={`rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs ${
        missingRequired.length > 0
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : shortOpen.length > 0 || bookmarkedCount > 0
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        <div className="flex items-center gap-2 font-medium">
          {missingRequired.length === 0 && shortOpen.length === 0 && bookmarkedCount === 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Submission Readiness Check: All required questions answered with strong detail!</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {missingRequired.length > 0
                  ? `${missingRequired.length} required question${missingRequired.length === 1 ? '' : 's'} still unanswered.`
                  : ''}
                {shortOpen.length > 0
                  ? ` ${shortOpen.length} written answer${shortOpen.length === 1 ? ' is' : 's are'} under 8 words.`
                  : ''}
                {bookmarkedCount > 0
                  ? ` ${bookmarkedCount} bookmarked for review.`
                  : ''}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
      {questions.map((q, i) => {
        if (q.type === 'section') return null;
        const val = formatAnswer(q, answers[q.id]);
        const isBookmarked = Boolean(bookmarks[q.id]);
        return (
          <button type="button" key={q.id} onClick={() => onEdit(i)} className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors group ${isBookmarked ? 'bg-amber-500/[0.05] border-amber-500/30 hover:border-amber-400/50' : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-semibold shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span>{q.text}{q.required && <span className="text-rose-400 ml-1">*</span>}</span>
                {isBookmarked && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-semibold text-amber-300">
                    <Bookmark className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> Bookmarked
                  </span>
                )}
              </div>
              {val === null ? (
                <div className={`mt-0.5 text-sm italic ${q.required ? 'text-rose-300' : 'text-slate-500'}`}>{q.required ? 'Required — not answered' : 'Skipped'}</div>
              ) : q.type === 'rating' ? (
                <div className="mt-1 flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${answers[q.id] >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />)}</div>
              ) : (q.type === 'file' || q.type === 'screenshot') && typeof answers[q.id] === 'string' && answers[q.id].startsWith('file:') ? (
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
    </div>
  );
}