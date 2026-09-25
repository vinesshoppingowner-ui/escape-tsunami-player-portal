import { AlertTriangle, RotateCcw } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { RESPONSE_STATUS } from '@/lib/applicationTypes';
import AIScoreBadge from './AIScoreBadge';

export default function ResponseListItem({ response: r, onOpen }) {
  const st = RESPONSE_STATUS[r.status] || RESPONSE_STATUS.submitted;
  const flags = r.ai_review ? JSON.parse(r.ai_review).flags || [] : [];
  return (
    <button onClick={onOpen} className="w-full text-left rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] p-3 flex items-center gap-3 transition-colors">
      <RobloxAvatar username={r.roblox_username} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-white">{r.roblox_username || 'Unknown'}</span>
          <AIScoreBadge score={r.ai_score} />
          {r.attempt > 1 && <span className="inline-flex items-center gap-1 text-[10px] text-amber-300"><RotateCcw className="h-3 w-3" /> Attempt {r.attempt}</span>}
          {flags.length > 0 && <span className="inline-flex items-center gap-1 text-[10px] text-rose-300"><AlertTriangle className="h-3 w-3" /> {flags.length} flag{flags.length > 1 ? 's' : ''}</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{r.ai_summary || `${r.submitted_by_email || ''} · ${new Date(r.created_date).toLocaleString()}`}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
        <span className="text-[10px] text-slate-600">{new Date(r.created_date).toLocaleDateString()}</span>
      </div>
    </button>
  );
}