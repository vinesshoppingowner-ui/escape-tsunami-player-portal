import { useState, useMemo } from 'react';
import { formatAnswer } from '@/lib/applicationTypes';
import { Star, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_META = {
  submitted: { label: 'Submitted', icon: Clock, color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  under_review: { label: 'Under Review', icon: Clock, color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

export default function SubmissionDetailModal({ response, onClose }) {
  const questions = useMemo(() => {
    try { return JSON.parse(response?.application?.questions || '[]'); } catch { return []; }
  }, [response]);

  const answers = useMemo(() => {
    try { return JSON.parse(response?.answers || '{}'); } catch { return {}; }
  }, [response]);

  if (!response) return null;

  const meta = STATUS_META[response.status] || STATUS_META.submitted;
  const StatusIcon = meta.icon;

  return (
    <Dialog open={!!response} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bg} ${meta.border} border ${meta.color} text-xs font-medium mb-2`}>
                <StatusIcon className="h-3 w-3" /> {meta.label}
                {response.attempt > 1 && <span className="ml-1 text-amber-300">· Attempt #{response.attempt}</span>}
              </div>
              <DialogTitle className="font-display text-xl font-bold text-white">{response.application_title || 'Application'}</DialogTitle>
              <p className="mt-1 text-xs text-slate-500">Submitted {new Date(response.created_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {response.applicant_feedback && (
          <div className="mt-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">Staff Feedback</div>
            <p className="text-sm text-slate-200 leading-relaxed">{response.applicant_feedback}</p>
          </div>
        )}

        {response.reviewed_by && (
          <div className="mt-3 text-xs text-slate-500">
            Reviewed by {response.reviewed_by}
            {response.reviewed_at && ` on ${new Date(response.reviewed_at).toLocaleDateString()}`}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Answers</div>
          {questions.length === 0 ? (
            <p className="text-sm text-slate-500">Answer data is no longer available.</p>
          ) : questions.map((q, i) => {
            const val = formatAnswer(q, answers[q.id]);
            return (
              <div key={q.id || i} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-semibold shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400">{q.text}{q.required && <span className="text-rose-400 ml-1">*</span>}</div>
                    {val === null ? (
                      <div className="mt-0.5 text-sm italic text-slate-600">{q.required ? 'Not answered' : 'Skipped'}</div>
                    ) : q.type === 'rating' ? (
                      <div className="mt-1 flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${answers[q.id] >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />)}</div>
                    ) : (
                      <div className="mt-0.5 text-sm text-white whitespace-pre-wrap break-words">{val}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}