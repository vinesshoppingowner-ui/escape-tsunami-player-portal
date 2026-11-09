import { useMemo } from 'react';
import { X, Star, Check, Clock, Sparkles, Columns } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { RESPONSE_STATUS, formatAnswer } from '@/lib/applicationTypes';
import { safeParse } from '@/lib/safeParse';
import NewBadge from '@/components/ui/new-badge';

export default function CompareCandidatesModal({ responses = [], application, onClose, onQuickStatus, onStar }) {
  const questions = useMemo(
    () => safeParse(application?.questions, []).filter((q) => q.type !== 'section'),
    [application?.questions]
  );

  if (!responses.length) return null;

  const getWordCount = (resp) => {
    const ans = safeParse(resp.answers, {});
    return questions.reduce((sum, q) => {
      const raw = ans[q.id];
      if (typeof raw === 'string' && raw.startsWith('file:')) return sum;
      const formatted = formatAnswer(q, raw);
      return sum + (formatted ? String(formatted).trim().split(/\s+/).filter(Boolean).length : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-2xl bg-slate-950/95 border border-cyan-500/30 px-5 py-3.5 shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Columns className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Side-by-Side Candidate Comparison</h2>
                <NewBadge />
              </div>
              <p className="text-xs text-slate-400">
                Comparing {responses.length} applicants for {application?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Candidate Header Cards */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${responses.length}, minmax(260px, 1fr))` }}
        >
          {responses.map((r) => {
            const st = RESPONSE_STATUS[r.status] || RESPONSE_STATUS.submitted;
            const aiRev = safeParse(r.ai_review, {});
            const words = getWordCount(r);
            return (
              <div key={r.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RobloxAvatar username={r.roblox_username} size={40} />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{r.roblox_username || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-500 truncate">{r.submitted_by_email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStar?.(r)}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5"
                    title="Shortlist"
                  >
                    <Star className={`h-4 w-4 ${r.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-950/70 border border-white/5 p-2">
                    <div className="text-sm font-bold text-violet-300 flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3" /> {r.ai_score ?? '—'}
                    </div>
                    <div className="text-[10px] text-slate-500">AI Score</div>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 border border-white/5 p-2">
                    <div className="text-sm font-bold text-amber-300">
                      {r.staff_rating ? `${r.staff_rating}★` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-500">Staff Rating</div>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 border border-white/5 p-2">
                    <div className="text-sm font-bold text-cyan-300">{words}</div>
                    <div className="text-[10px] text-slate-500">Total Words</div>
                  </div>
                </div>

                {aiRev?.subscores && (
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-950/50 rounded-xl p-2.5 border border-white/5">
                    <div className="flex justify-between text-slate-400"><span>Effort:</span><strong className="text-white">{aiRev.subscores.effort}%</strong></div>
                    <div className="flex justify-between text-slate-400"><span>Maturity:</span><strong className="text-white">{aiRev.subscores.maturity}%</strong></div>
                    <div className="flex justify-between text-slate-400"><span>Authentic:</span><strong className="text-white">{aiRev.subscores.authenticity}%</strong></div>
                    <div className="flex justify-between text-slate-400"><span>Role Fit:</span><strong className="text-white">{aiRev.subscores.fit}%</strong></div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuickStatus?.(r, 'accepted')}
                      className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-medium text-emerald-200 inline-flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickStatus?.(r, 'under_review')}
                      className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-[11px] font-medium text-violet-200 inline-flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" /> Review
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickStatus?.(r, 'rejected')}
                      className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-medium text-rose-200 inline-flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question-by-Question Side-by-Side Matrix */}
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300 text-xs font-bold">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {q.text}
                  {q.required && <span className="text-rose-400 ml-1">*</span>}
                </h4>
              </div>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${responses.length}, minmax(260px, 1fr))` }}
              >
                {responses.map((r) => {
                  const ans = safeParse(r.answers, {});
                  const formatted = formatAnswer(q, ans[q.id]);
                  return (
                    <div key={r.id} className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        @{r.roblox_username || 'Applicant'}
                      </div>
                      {formatted ? (
                        <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed break-words">
                          {formatted}
                        </div>
                      ) : (
                        <div className="text-xs italic text-slate-600">No answer</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}