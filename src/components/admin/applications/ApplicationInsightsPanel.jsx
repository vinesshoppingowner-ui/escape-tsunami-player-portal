import { BarChart3, Sparkles, Clock, Award, Tag, FileText } from 'lucide-react';
import { safeParse } from '@/lib/safeParse';

export default function ApplicationInsightsPanel({ responses, questions }) {
  if (!responses?.length) return null;

  const total = responses.length;
  const counts = {
    submitted: responses.filter((r) => r.status === 'submitted').length,
    under_review: responses.filter((r) => r.status === 'under_review').length,
    accepted: responses.filter((r) => r.status === 'accepted').length,
    rejected: responses.filter((r) => r.status === 'rejected').length,
  };

  const scored = responses.filter((r) => r.ai_score != null);
  const buckets = {
    high: scored.filter((r) => r.ai_score >= 75).length,
    mid: scored.filter((r) => r.ai_score >= 45 && r.ai_score < 75).length,
    low: scored.filter((r) => r.ai_score < 45).length,
  };

  // Calculate average word count across all answers
  const wordCounts = responses.map((r) => {
    const ans = safeParse(r.answers, {});
    return Object.values(ans)
      .map((v) => (Array.isArray(v) ? v.join(' ') : String(v ?? '')))
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
  });
  const avgWords = wordCounts.length ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;

  // Average turnaround time (hours) for reviewed applications
  const turnaroundHours = responses
    .filter((r) => r.reviewed_at && r.created_date)
    .map((r) => Math.max(0, (new Date(r.reviewed_at) - new Date(r.created_date)) / 36e5));
  const avgTurnaround = turnaroundHours.length
    ? turnaroundHours.reduce((a, b) => a + b, 0) / turnaroundHours.length
    : null;

  // Top reviewers
  const reviewerMap = {};
  responses.forEach((r) => {
    if (r.reviewed_by) reviewerMap[r.reviewed_by] = (reviewerMap[r.reviewed_by] || 0) + 1;
  });
  const topReviewers = Object.entries(reviewerMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Tag frequency
  const tagMap = {};
  responses.forEach((r) => (r.tags || []).forEach((t) => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white">Staff Review Insights</h4>
        </div>
        <span className="text-xs text-slate-500">{questions?.length || 0} questions · {total} total submissions</span>
      </div>

      {/* Pipeline Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Review Pipeline Breakdown</span>
          <span>{Math.round(((counts.accepted + counts.rejected) / total) * 100)}% decided</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden flex">
          {counts.accepted > 0 && <div style={{ width: `${(counts.accepted / total) * 100}%` }} className="bg-emerald-500" title={`Accepted: ${counts.accepted}`} />}
          {counts.under_review > 0 && <div style={{ width: `${(counts.under_review / total) * 100}%` }} className="bg-violet-500" title={`Under Review: ${counts.under_review}`} />}
          {counts.submitted > 0 && <div style={{ width: `${(counts.submitted / total) * 100}%` }} className="bg-sky-500" title={`Pending: ${counts.submitted}`} />}
          {counts.rejected > 0 && <div style={{ width: `${(counts.rejected / total) * 100}%` }} className="bg-rose-500" title={`Rejected: ${counts.rejected}`} />}
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Accepted ({counts.accepted})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Under Review ({counts.under_review})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Submitted ({counts.submitted})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Rejected ({counts.rejected})</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 pt-1">
        <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" /> AI Score Tiers
          </div>
          {scored.length ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-emerald-300"><span>Strong (75+)</span><span className="font-semibold">{buckets.high}</span></div>
              <div className="flex justify-between text-amber-300"><span>Moderate (45–74)</span><span className="font-semibold">{buckets.mid}</span></div>
              <div className="flex justify-between text-rose-300"><span>Weak (&lt;45)</span><span className="font-semibold">{buckets.low}</span></div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No AI scores run yet</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <FileText className="h-3.5 w-3.5 text-cyan-400" /> Effort & Depth
          </div>
          <div className="text-lg font-bold text-white">{avgWords} <span className="text-xs font-normal text-slate-400">words avg</span></div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {avgWords >= 120 ? 'High detail responses' : avgWords >= 50 ? 'Moderate length' : 'Short / brief answers'}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Clock className="h-3.5 w-3.5 text-amber-400" /> Review Speed
          </div>
          <div className="text-lg font-bold text-white">
            {avgTurnaround == null ? '—' : avgTurnaround < 1 ? `${Math.round(avgTurnaround * 60)}m` : `${avgTurnaround.toFixed(1)}h`}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{turnaroundHours.length} reviewed so far</p>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Award className="h-3.5 w-3.5 text-emerald-400" /> Top Reviewers
          </div>
          {topReviewers.length ? (
            <div className="space-y-1 text-xs">
              {topReviewers.map(([email, cnt]) => (
                <div key={email} className="flex justify-between gap-2">
                  <span className="text-slate-300 truncate">{email.split('@')[0]}</span>
                  <span className="font-semibold text-white shrink-0">{cnt}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No reviews logged yet</p>
          )}
        </div>
      </div>

      {topTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1"><Tag className="h-3 w-3" /> Popular tags:</span>
          {topTags.map(([t, cnt]) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
              {t} <span className="text-cyan-300 font-semibold ml-0.5">{cnt}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}