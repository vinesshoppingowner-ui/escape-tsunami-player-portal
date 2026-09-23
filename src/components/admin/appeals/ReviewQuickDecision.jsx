import { useState } from 'react';
import { Check, X, Eye, Loader2 } from 'lucide-react';

const BUTTONS = [
  { status: 'Approved', label: 'Approve', icon: Check, cls: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { status: 'Denied', label: 'Deny', icon: X, cls: 'border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20' },
  { status: 'Under Review', label: 'Under Review', icon: Eye, cls: 'border-violet-500/30 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20' },
];

export default function ReviewQuickDecision({ current, onDecide }) {
  const [busy, setBusy] = useState(null);
  const run = async (status) => {
    setBusy(status);
    await onDecide(status);
    setBusy(null);
  };
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
      <div className="text-slate-500 text-[11px] uppercase tracking-wider font-medium mb-2">One-click decision</div>
      <div className="grid grid-cols-3 gap-2">
        {BUTTONS.map((b) => (
          <button
            key={b.status}
            disabled={!!busy || current === b.status}
            onClick={() => run(b.status)}
            className={`inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 ${b.cls}`}
          >
            {busy === b.status ? <Loader2 className="h-4 w-4 animate-spin" /> : <b.icon className="h-4 w-4" />}
            {b.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 mt-2">Saves instantly using the response and notes below.</p>
    </div>
  );
}