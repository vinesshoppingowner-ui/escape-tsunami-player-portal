import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { logStaffAction } from '@/lib/staffLog';

export default function AdminLockButton({ appeal, user, onChanged }) {
  const [busy, setBusy] = useState(false);
  const locked = !!appeal.admin_locked;

  const toggle = async () => {
    setBusy(true);
    const name = user?.full_name || user?.email || 'Admin';
    await base44.entities.Appeal.update(appeal.id, { admin_locked: !locked, locked_by: locked ? '' : name });
    await logStaffAction(user, 'appeal_decision', appeal.roblox_username, locked ? 'Unlocked appeal for staff' : 'Locked appeal to admins only');
    setBusy(false);
    onChanged();
  };

  return (
    <button
      disabled={busy}
      onClick={toggle}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-violet-500/30 text-violet-300 hover:bg-violet-500/15 text-xs font-medium transition-colors disabled:opacity-40"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : locked ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
      {locked ? 'Unlock for staff' : 'Lock to admins only'}
    </button>
  );
}