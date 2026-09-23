import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLockButton from '@/components/admin/appeals/AdminLockButton';
import { Copy, ExternalLink, Lock, Unlock, Trash2, Loader2, Check } from 'lucide-react';

export default function ReviewAppealManage({ appeal, canReappeal, onReappealChange, onDeleted, isAdmin, user, onChanged }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(null);
  const btn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40';

  const copy = async () => {
    await navigator.clipboard.writeText(appeal.roblox_username);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleLock = async () => {
    setBusy('lock');
    await base44.entities.Appeal.update(appeal.id, { can_reappeal: !canReappeal });
    onReappealChange(!canReappeal);
    setBusy(null);
  };

  const remove = async () => {
    if (!window.confirm(`Delete this appeal from ${appeal.roblox_username}? This can't be undone.`)) return;
    setBusy('delete');
    await base44.entities.Appeal.delete(appeal.id);
    onDeleted();
  };

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
      <div className="text-slate-500 text-[11px] uppercase tracking-wider font-medium mb-2">Appeal management</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={copy} className={`${btn} border-white/10 text-slate-200 hover:bg-white/10`}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy username'}
        </button>
        <a
          href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(appeal.roblox_username)}`}
          target="_blank"
          rel="noreferrer"
          className={`${btn} border-white/10 text-slate-200 hover:bg-white/10`}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Roblox profile
        </a>
        <button disabled={!!busy} onClick={toggleLock} className={`${btn} border-amber-500/30 text-amber-300 hover:bg-amber-500/15`}>
          {busy === 'lock' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : canReappeal ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          {canReappeal ? 'Lock re-appeals' : 'Allow re-appeals'}
        </button>
        {isAdmin && <AdminLockButton appeal={appeal} user={user} onChanged={onChanged} />}
        <button disabled={!!busy} onClick={remove} className={`${btn} border-rose-500/30 text-rose-300 hover:bg-rose-500/15 ml-auto`}>
          {busy === 'delete' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete appeal
        </button>
      </div>
    </div>
  );
}