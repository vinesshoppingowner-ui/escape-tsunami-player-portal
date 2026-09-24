import { useState } from 'react';
import { Undo2, Loader2 } from 'lucide-react';
import { undoStaffAction } from '@/lib/staffUndo';

export default function StaffLogUndoButton({ log, user, onDone }) {
  const [busy, setBusy] = useState(false);

  const undo = async () => {
    if (!window.confirm(`Undo this action?\n\n"${log.detail}" by ${log.staff_username}`)) return;
    setBusy(true);
    try {
      await undoStaffAction(log, user);
      onDone(true);
    } catch (e) {
      onDone(false, e.message || 'The record may have already changed or been deleted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={undo} disabled={busy} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 disabled:opacity-50">
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />} Undo
    </button>
  );
}