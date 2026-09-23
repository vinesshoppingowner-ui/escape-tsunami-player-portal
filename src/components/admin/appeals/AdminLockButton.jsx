import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Ban, Unlock, Loader2 } from 'lucide-react';
import { logStaffAction } from '@/lib/staffLog';

// Locks/unlocks the player from submitting ANY appeals.
export default function AdminLockButton({ appeal, user, playerLocked, onChanged }) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!playerLocked && !window.confirm(`Block ${appeal.roblox_username} from submitting any appeals?`)) return;
    setBusy(true);
    const name = user?.full_name || user?.email || 'Admin';
    if (playerLocked) {
      await base44.entities.Appeal.updateMany(
        { roblox_username: appeal.roblox_username, admin_locked: true },
        { $set: { admin_locked: false, locked_by: '' } }
      );
    } else {
      await base44.entities.Appeal.update(appeal.id, { admin_locked: true, locked_by: name });
    }
    await logStaffAction(user, 'appeal_decision', appeal.roblox_username, playerLocked ? 'Unlocked appeals for player' : 'Locked player from submitting appeals');
    setBusy(false);
    onChanged();
  };

  return (
    <button
      disabled={busy}
      onClick={toggle}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-violet-500/30 text-violet-300 hover:bg-violet-500/15 text-xs font-medium transition-colors disabled:opacity-40"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playerLocked ? <Unlock className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
      {playerLocked ? 'Unlock appeals for player' : 'Lock all appeals for player'}
    </button>
  );
}