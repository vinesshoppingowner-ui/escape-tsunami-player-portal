import { Check, X, Eye, Loader2 } from 'lucide-react';

const ACTIONS = [
  { status: 'Under Review', label: 'Review', icon: Eye, cls: 'text-violet-300 hover:bg-violet-500/15 border-violet-500/25' },
  { status: 'Approved', label: 'Approve', icon: Check, cls: 'text-emerald-300 hover:bg-emerald-500/15 border-emerald-500/25' },
  { status: 'Denied', label: 'Deny', icon: X, cls: 'text-rose-300 hover:bg-rose-500/15 border-rose-500/25' },
];

export default function AppealQuickActions({ current, busy, onAction }) {
  if (busy) return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {ACTIONS.filter((a) => a.status !== current).map((a) => (
        <button
          key={a.status}
          onClick={() => onAction(a.status)}
          title={a.label}
          className={`inline-flex items-center gap-1 h-7 px-2 rounded-md border bg-white/[0.02] text-xs font-medium transition-colors ${a.cls}`}
        >
          <a.icon className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{a.label}</span>
        </button>
      ))}
    </div>
  );
}