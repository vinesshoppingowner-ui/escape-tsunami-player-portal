import { Check, X, Eye, Loader2 } from 'lucide-react';

const ACTIONS = [
  { status: 'Under Review', label: 'Review', icon: Eye, cls: 'text-violet-200 hover:bg-violet-500/25' },
  { status: 'Approved', label: 'Approve', icon: Check, cls: 'text-emerald-200 hover:bg-emerald-500/25' },
  { status: 'Denied', label: 'Deny', icon: X, cls: 'text-rose-200 hover:bg-rose-500/25' },
];

export default function AppealQuickActions({ current, busy, onAction }) {
  if (busy) return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  return (
    <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] divide-x divide-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {ACTIONS.filter((a) => a.status !== current).map((a) => (
        <button
          key={a.status}
          onClick={() => onAction(a.status)}
          title={a.label}
          className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold transition-colors ${a.cls}`}
        >
          <a.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{a.label}</span>
        </button>
      ))}
    </div>
  );
}