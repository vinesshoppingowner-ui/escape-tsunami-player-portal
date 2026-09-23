import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { STATUS_STYLES } from '@/components/admin/appeals/appealMeta';

export default function ClosedAppealItem({ appeal, onChanged }) {
  const [busy, setBusy] = useState(null);

  const restore = async () => {
    setBusy('restore');
    await base44.entities.Appeal.update(appeal.id, { removed: false, removed_by: '', removed_at: null });
    onChanged();
  };

  const purge = async () => {
    if (!window.confirm(`Permanently delete this appeal from ${appeal.roblox_username}? This can't be undone.`)) return;
    setBusy('purge');
    await base44.entities.Appeal.delete(appeal.id);
    onChanged();
  };

  const when = appeal.removed ? appeal.removed_at : appeal.updated_date;

  return (
    <div className="rounded-xl bg-slate-950/40 border border-white/10 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-white text-sm">{appeal.roblox_username}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[appeal.status] || ''}`}>{appeal.status}</span>
        {when && <span className="text-[11px] text-slate-500">{new Date(when).toLocaleDateString()}</span>}
        {appeal.removed && appeal.removed_by && <span className="text-[11px] text-slate-500">· removed by {appeal.removed_by}</span>}
        {appeal.removed && (
          <div className="ml-auto flex gap-1.5">
            <button disabled={!!busy} onClick={restore} className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 text-xs disabled:opacity-40">
              {busy === 'restore' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />} Restore
            </button>
            <button disabled={!!busy} onClick={purge} className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/15 text-xs disabled:opacity-40">
              {busy === 'purge' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete forever
            </button>
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{appeal.appeal_reason}</p>
      {appeal.staff_response && <p className="mt-1 text-xs text-slate-500 italic line-clamp-1">Staff: “{appeal.staff_response}”</p>}
    </div>
  );
}