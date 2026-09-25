import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, ThumbsUp, AlertTriangle, Flag } from 'lucide-react';
import { runAIReview } from '@/lib/applicationAI';
import { useToast } from '@/components/ui/use-toast';

const REC = {
  accept: { label: 'Recommends accept', cls: 'text-emerald-300' },
  review: { label: 'Needs a closer look', cls: 'text-amber-300' },
  reject: { label: 'Recommends reject', cls: 'text-rose-300' },
};

const ringColor = (s) => (s >= 75 ? '#34d399' : s >= 45 ? '#fbbf24' : '#fb7185');

export default function ResponseAIPanel({ response, application, onUpdate }) {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const review = response.ai_review ? JSON.parse(response.ai_review) : null;
  const has = response.ai_score !== undefined && response.ai_score !== null;

  const run = async () => {
    setRunning(true);
    try {
      const fields = await runAIReview(application, JSON.parse(response.answers || '{}'));
      onUpdate(await base44.entities.ApplicationResponse.update(response.id, fields));
    } catch (e) {
      toast({ title: 'AI check failed', description: e.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-2xl bg-violet-500/[0.06] border border-violet-500/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-200"><Sparkles className="h-4 w-4" /> AI check</div>
        <button onClick={run} disabled={running} className="text-xs text-violet-300 hover:text-white inline-flex items-center gap-1 disabled:opacity-50">
          {running && <Loader2 className="h-3 w-3 animate-spin" />} {running ? 'Checking…' : has ? 'Re-run' : 'Run AI check'}
        </button>
      </div>
      {!has ? (
        <p className="text-xs text-slate-400">{running ? 'Reading the answers…' : 'Get a score, summary and red flags for this applicant.'}</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full grid place-items-center shrink-0" style={{ background: `conic-gradient(${ringColor(response.ai_score)} ${response.ai_score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}>
              <div className="h-11 w-11 rounded-full bg-slate-900 grid place-items-center text-sm font-bold">{response.ai_score}</div>
            </div>
            <div>
              <div className={`text-sm font-semibold ${REC[response.ai_recommendation]?.cls || ''}`}>{REC[response.ai_recommendation]?.label}</div>
              <p className="text-xs text-slate-400 leading-snug">{response.ai_summary}</p>
            </div>
          </div>
          {review?.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {review.flags.map((f) => <span key={f} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-200"><Flag className="h-2.5 w-2.5" /> {f}</span>)}
            </div>
          )}
          {[['Strengths', review?.strengths, ThumbsUp, 'text-emerald-300'], ['Concerns', review?.concerns, AlertTriangle, 'text-amber-300']].map(([label, items, Icon, cls]) => items?.length > 0 && (
            <div key={label}>
              <div className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${cls}`}><Icon className="h-3 w-3" /> {label}</div>
              <ul className="mt-1 space-y-0.5 text-xs text-slate-300 list-disc pl-4">{items.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}