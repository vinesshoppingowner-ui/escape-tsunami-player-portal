import { Loader2, Undo2, TimerOff, Trash2, X, Gavel } from 'lucide-react';

export default function ModerationBulkBar({ count, running, onAction, onClear, onIssue }) {
  if (!count) return null;
  const btn = 'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border disabled:opacity-50';
  return (
    <div className="sticky top-2 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-900/95 border border-cyan-500/30 px-3 py-2 backdrop-blur">
      <span className="text-sm text-white font-medium">{count} selected</span>
      {running && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      <div className="ml-auto flex flex-wrap gap-2">
        <button disabled={running} onClick={onIssue} className={`${btn} bg-cyan-500/10 border-cyan-500/30 text-cyan-300`}><Gavel className="h-3.5 w-3.5" /> Issue action to players</button>
        <button disabled={running} onClick={() => onAction('Repealed')} className={`${btn} bg-emerald-500/10 border-emerald-500/30 text-emerald-300`}><Undo2 className="h-3.5 w-3.5" /> Repeal</button>
        <button disabled={running} onClick={() => onAction('Expired')} className={`${btn} bg-slate-500/10 border-white/15 text-slate-300`}><TimerOff className="h-3.5 w-3.5" /> Expire</button>
        <button disabled={running} onClick={() => onAction('delete')} className={`${btn} bg-rose-500/10 border-rose-500/30 text-rose-300`}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        <button disabled={running} onClick={onClear} className={`${btn} border-white/10 text-slate-400`}><X className="h-3.5 w-3.5" /> Clear</button>
      </div>
    </div>
  );
}