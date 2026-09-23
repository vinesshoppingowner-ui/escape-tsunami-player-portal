import { Check, X, Eye, Loader2 } from 'lucide-react';

export default function AppealsBulkBar({ count, running, onAction, onClear }) {
  if (!count) return null;
  const btn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50';
  return (
    <div className="sticky top-20 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/25 bg-slate-900/85 backdrop-blur-xl px-4 py-2.5 shadow-lg shadow-slate-950/40">
      <span className="text-sm text-white font-medium">{count} selected</span>
      {running && <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />}
      <div className="flex-1" />
      <button disabled={running} onClick={() => onAction('Under Review')} className={`${btn} border-violet-500/30 text-violet-300 hover:bg-violet-500/15`}>
        <Eye className="h-3.5 w-3.5" /> Mark under review
      </button>
      <button disabled={running} onClick={() => onAction('Approved')} className={`${btn} border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15`}>
        <Check className="h-3.5 w-3.5" /> Approve all
      </button>
      <button disabled={running} onClick={() => onAction('Denied')} className={`${btn} border-rose-500/30 text-rose-300 hover:bg-rose-500/15`}>
        <X className="h-3.5 w-3.5" /> Deny all
      </button>
      <button disabled={running} onClick={onClear} className={`${btn} border-white/10 text-slate-300 hover:bg-white/10`}>
        Clear
      </button>
    </div>
  );
}