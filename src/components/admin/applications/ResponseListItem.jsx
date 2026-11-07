import { AlertTriangle, RotateCcw, Star, Sparkles, Check, Clock, X } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { RESPONSE_STATUS } from '@/lib/applicationTypes';
import { isNewSubmission } from '@/hooks/useLiveApplications';
import AIScoreBadge from './AIScoreBadge';

export default function ResponseListItem({ response: r, nowMs, onOpen, selected, onSelect, onStar, onQuickStatus }) {
  const st = RESPONSE_STATUS[r.status] || RESPONSE_STATUS.submitted;
  const flags = r.ai_review ? JSON.parse(r.ai_review).flags || [] : [];
  const isNew = isNewSubmission(r.created_date, nowMs);

  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 accent-cyan-500 shrink-0" />
      <button onClick={onStar} title="Shortlist" className="shrink-0">
        <Star className={`h-4 w-4 ${r.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'}`} />
      </button>
      <div
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
        className={`flex-1 min-w-0 text-left rounded-xl border p-3 flex items-center gap-3 transition-colors cursor-pointer ${
          isNew
            ? 'bg-emerald-500/[0.05] border-emerald-500/35 hover:border-emerald-400/50 hover:bg-emerald-500/[0.08]'
            : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05]'
        }`}
      >
        <RobloxAvatar username={r.roblox_username} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">{r.roblox_username || 'Unknown'}</span>
            {isNew && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse">
                <Sparkles className="h-2.5 w-2.5" /> New
              </span>
            )}
            <AIScoreBadge score={r.ai_score} />
            {r.ai_recommendation && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${
                r.ai_recommendation === 'accept'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : r.ai_recommendation === 'reject'
                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                  : 'bg-violet-500/10 border-violet-500/25 text-violet-300'
              }`}>
                AI: {r.ai_recommendation}
              </span>
            )}
            {r.attempt > 1 && <span className="inline-flex items-center gap-1 text-[10px] text-amber-300"><RotateCcw className="h-3 w-3" /> Attempt {r.attempt}</span>}
            {r.staff_rating > 0 && <span className="text-[10px] text-amber-300">{'★'.repeat(r.staff_rating)}</span>}
            {(r.tags || []).map((t) => <span key={t} className="text-[10px] px-1.5 rounded bg-cyan-500/10 text-cyan-200">{t}</span>)}
            {flags.length > 0 && <span className="inline-flex items-center gap-1 text-[10px] text-rose-300"><AlertTriangle className="h-3 w-3" /> {flags.length} flag{flags.length > 1 ? 's' : ''}</span>}
          </div>
          <p className="text-xs text-slate-500 truncate">{r.ai_summary || `${r.submitted_by_email || ''} · ${new Date(r.created_date).toLocaleString()}`}</p>
        </div>

        {onQuickStatus && (
          <div className="hidden sm:flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onQuickStatus(r, 'accepted')}
              title="Quick Accept"
              className={`p-1.5 rounded-lg border transition-colors ${
                r.status === 'accepted'
                  ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onQuickStatus(r, 'under_review')}
              title="Mark Under Review"
              className={`p-1.5 rounded-lg border transition-colors ${
                r.status === 'under_review'
                  ? 'bg-violet-500/25 border-violet-500/50 text-violet-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-violet-300 hover:border-violet-500/30'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onQuickStatus(r, 'rejected')}
              title="Quick Reject"
              className={`p-1.5 rounded-lg border transition-colors ${
                r.status === 'rejected'
                  ? 'bg-rose-500/25 border-rose-500/50 text-rose-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-500/30'
              }`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
          <span className="text-[10px] text-slate-600">{new Date(r.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(r.created_date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}