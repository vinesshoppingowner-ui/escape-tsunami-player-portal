import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, ThumbsUp, AlertTriangle, Flag, ShieldCheck, MessageSquarePlus, Copy, Check, Wand2, Cpu } from 'lucide-react';
import { runAIReview } from '@/lib/applicationAI';
import { useToast } from '@/components/ui/use-toast';
import { safeParse } from '@/lib/safeParse';
import NewBadge from '@/components/ui/new-badge';

const REC = {
  accept: { label: 'Recommends Accept', cls: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
  review: { label: 'Needs Closer Review', cls: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
  reject: { label: 'Recommends Reject', cls: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
};

const ringColor = (s) => (s >= 75 ? '#34d399' : s >= 45 ? '#fbbf24' : '#fb7185');
const barColor = (s) => (s >= 75 ? 'bg-emerald-400' : s >= 45 ? 'bg-amber-400' : 'bg-rose-400');

export default function ResponseAIPanel({ response, application, onUpdate, onApplySuggestedFeedback }) {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  const review = safeParse(response.ai_review, null);
  const has = response.ai_score !== undefined && response.ai_score !== null;
  const subscores = review?.subscores || (has ? {
    effort: response.ai_score,
    maturity: response.ai_score,
    authenticity: 85,
    fit: response.ai_score,
  } : null);

  const run = async () => {
    setRunning(true);
    try {
      const fields = await runAIReview(application, safeParse(response.answers, {}));
      const updated = await base44.entities.ApplicationResponse.update(response.id, fields);
      onUpdate(updated);
      toast({ title: 'Google Gemini AI check complete' });
    } catch (e) {
      toast({ title: 'AI check failed', description: e.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const copyInterviewQuestions = () => {
    if (!review?.interview_questions?.length) return;
    const text = review.interview_questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 1800);
    toast({ title: 'Follow-up interview questions copied!' });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-violet-500/[0.09] via-slate-900/70 to-slate-950/90 border border-violet-500/25 p-4 space-y-3.5 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-400/30 text-violet-300 shrink-0">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <span>Google AI Review</span>
              <NewBadge />
            </div>
            <div className="text-[10px] text-violet-300/80 flex items-center gap-1">
              <Cpu className="h-2.5 w-2.5" />
              <span>{review?.provider === 'builtin' ? 'Built-in AI' : 'Powered by Google Gemini Key'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="px-2.5 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/30 text-xs font-medium text-violet-200 hover:text-white inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {running ? 'Analyzing…' : has ? 'Re-run AI' : 'Run AI Check'}
        </button>
      </div>

      {!has ? (
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 text-center space-y-2">
          <p className="text-xs text-slate-300">
            {running
              ? 'Google Gemini is grading effort, maturity, authenticity, and generating interview questions…'
              : 'Run a deep AI screening with 4-pillar breakdown, authenticity detection, and tailored follow-up questions.'}
          </p>
        </div>
      ) : (
        <>
          {/* Score + Recommendation + Summary */}
          <div className="flex items-start gap-3.5 rounded-xl bg-slate-950/70 border border-white/10 p-3">
            <div
              className="h-16 w-16 rounded-full grid place-items-center shrink-0 shadow-inner"
              style={{
                background: `conic-gradient(${ringColor(response.ai_score)} ${response.ai_score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            >
              <div className="h-12 w-12 rounded-full bg-slate-950 grid place-items-center">
                <div className="text-center leading-none">
                  <div className="text-base font-extrabold text-white">{response.ai_score}</div>
                  <div className="text-[9px] text-slate-500 uppercase">/100</div>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${REC[response.ai_recommendation]?.cls || 'text-slate-300 border-white/10'}`}>
                  {REC[response.ai_recommendation]?.label || response.ai_recommendation}
                </span>
                {subscores?.authenticity !== undefined && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                      subscores.authenticity >= 70
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                    }`}
                    title="Estimated human authenticity vs AI/copy-paste likelihood"
                  >
                    <ShieldCheck className="h-3 w-3" /> {subscores.authenticity}% Authentic
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{response.ai_summary}</p>
            </div>
          </div>

          {/* 4-Pillar Breakdown Bars (NEW) */}
          {subscores && (
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Pillar Breakdown</span>
                <NewBadge />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ['Effort & Detail', subscores.effort],
                  ['Maturity & Tone', subscores.maturity],
                  ['Authenticity', subscores.authenticity],
                  ['Role Fit', subscores.fit],
                ].map(([label, val]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-semibold text-white tabular-nums">{val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor(val)}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          {review?.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {review.flags.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 font-medium">
                  <Flag className="h-3 w-3 text-rose-400" /> {f}
                </span>
              ))}
            </div>
          )}

          {/* Strengths & Concerns */}
          <div className="space-y-2.5">
            {[
              ['Strengths', review?.strengths, ThumbsUp, 'text-emerald-300', 'bg-emerald-500/[0.05] border-emerald-500/20'],
              ['Concerns', review?.concerns, AlertTriangle, 'text-amber-300', 'bg-amber-500/[0.05] border-amber-500/20'],
            ].map(
              ([label, items, Icon, cls, boxCls]) =>
                items?.length > 0 && (
                  <div key={label} className={`rounded-xl border p-2.5 ${boxCls}`}>
                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-200 list-disc pl-4">
                      {items.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>

          {/* Suggested Feedback 1-Click Apply */}
          {review?.suggested_feedback && onApplySuggestedFeedback && (
            <div className="rounded-xl bg-cyan-500/[0.06] border border-cyan-500/25 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <Wand2 className="h-3 w-3" /> Suggested Applicant Feedback
                </span>
                <NewBadge />
              </div>
              <p className="text-xs text-slate-300 italic leading-snug">"{review.suggested_feedback}"</p>
              <button
                type="button"
                onClick={() => {
                  onApplySuggestedFeedback(review.suggested_feedback, response.ai_recommendation);
                  toast({ title: 'Applied AI feedback to decision box' });
                }}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-xs font-medium text-cyan-200 transition-colors"
              >
                Use this feedback in Decision Panel
              </button>
            </div>
          )}

          {/* AI Follow-Up Interview Questions (NEW Feature inside Review Module) */}
          {review?.interview_questions?.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-300">
                  <MessageSquarePlus className="h-3.5 w-3.5" /> AI Interview Questions
                  <NewBadge />
                </div>
                <button
                  type="button"
                  onClick={copyInterviewQuestions}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
                >
                  {copiedQuestions ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedQuestions ? 'Copied' : 'Copy for Discord'}
                </button>
              </div>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal pl-4">
                {review.interview_questions.map((iq, idx) => (
                  <li key={idx} className="leading-snug">{iq}</li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}