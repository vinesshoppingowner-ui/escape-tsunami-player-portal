import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { clearBanToken } from '@/lib/banEvasion';

const LABELS = {
  Approved: ['Accepted', 'text-emerald-400'],
  Denied: ['Denied', 'text-rose-400'],
  'Under Review': ['Under review', 'text-slate-300'],
  Pending: ['Pending', 'text-slate-300'],
};

export default function BanAppealStatus({ appeal }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [label, color] = LABELS[appeal.status] || LABELS.Pending;

  const reactivate = async () => {
    setBusy(true);
    setError('');
    const ip = await fetch('https://api.ipify.org?format=json').then((r) => r.json()).then((d) => d.ip).catch(() => null);
    const res = await base44.functions.invoke('reactivateAccount', { ip }).catch((e) => ({ data: { error: e.response?.data?.error || e.message } }));
    if (res.data?.error) { setError(res.data.error); setBusy(false); return; }
    clearBanToken();
    window.location.reload();
  };

  return (
    <div className="text-sm">
      <p className="text-slate-400">Your report: <span className={`font-semibold ${color}`}>{label}</span>
        {appeal.decided_by && <> by <span className="text-white">{appeal.decided_by}</span></>}
      </p>
      {appeal.staff_response && <p className="mt-2 text-slate-300">"{appeal.staff_response}"</p>}
      {appeal.status === 'Approved' && (
        <button onClick={reactivate} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Reactivate account
        </button>
      )}
      {error && <p className="mt-2 text-rose-400">{error}</p>}
    </div>
  );
}