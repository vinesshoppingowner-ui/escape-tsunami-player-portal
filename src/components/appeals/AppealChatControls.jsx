import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Unlock, Trash2, Loader2 } from 'lucide-react';

// Staff-only controls in the chat header: lock/unlock the player's side and clear the chat.
export default function AppealChatControls({ appealId, locked, onLockChange, messages }) {
  const [busy, setBusy] = useState(false);

  const toggleLock = async () => {
    setBusy(true);
    await base44.entities.Appeal.update(appealId, { chat_locked: !locked });
    onLockChange(!locked);
    setBusy(false);
  };

  const clearChat = async () => {
    if (!messages.length || !window.confirm('Delete every message in this chat?')) return;
    setBusy(true);
    await base44.entities.AppealMessage.deleteMany({ appeal_id: appealId });
    setBusy(false);
  };

  const btn = 'h-7 px-2 rounded-md border border-white/10 text-[11px] text-slate-300 hover:bg-white/5 hover:text-white inline-flex items-center gap-1 disabled:opacity-50';
  return (
    <div className="flex items-center gap-1.5">
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      <button type="button" onClick={toggleLock} disabled={busy} className={btn}>
        {locked ? <><Unlock className="h-3.5 w-3.5" /> Unlock</> : <><Lock className="h-3.5 w-3.5" /> Lock chat</>}
      </button>
      <button type="button" onClick={clearChat} disabled={busy} className={`${btn} hover:text-rose-300`}>
        <Trash2 className="h-3.5 w-3.5" /> Clear
      </button>
    </div>
  );
}