import { CheckCircle2, XCircle, Clock, UserCheck, RefreshCw } from 'lucide-react';
import { clearBanToken } from '@/lib/banEvasion';

const STYLES = {
  Approved: { icon: CheckCircle2, text: 'Appeal accepted', cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  Denied: { icon: XCircle, text: 'Appeal denied', cls: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
  'Under Review': { icon: Clock, text: 'Under review', cls: 'border-violet-500/30 bg-violet-500/10 text-violet-300' },
  Pending: { icon: Clock, text: 'Waiting for staff', cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
};

export default function BanAppealStatus({ appeal }) {
  const s = STYLES[appeal.status] || STYLES.Pending;
  const Icon = s.icon;
  const reactivate = () => { clearBanToken(); window.location.reload(); };

  return (
    <div className={`rounded-xl border p-4 ${s.cls}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold"><Icon className="h-5 w-5" />{s.text}</div>
        <span className="text-xs text-slate-400">Sent {new Date(appeal.created_date).toLocaleDateString()}</span>
      </div>
      {appeal.decided_by && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
          <UserCheck className="h-3.5 w-3.5" /> {appeal.status === 'Approved' ? 'Accepted' : 'Denied'} by <span className="font-semibold text-white">{appeal.decided_by}</span>
          {appeal.decided_at && <span className="text-slate-500">· {new Date(appeal.decided_at).toLocaleString()}</span>}
        </div>
      )}
      {appeal.staff_response && <p className="mt-3 rounded-lg bg-black/20 p-3 text-sm text-slate-200">"{appeal.staff_response}"</p>}
      {appeal.status === 'Approved' && (
        <button onClick={reactivate} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-sm font-semibold text-white">
          <RefreshCw className="h-4 w-4" /> Reactivate my account
        </button>
      )}
    </div>
  );
}