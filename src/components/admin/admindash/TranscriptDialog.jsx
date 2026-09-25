import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AppealChatMessage from '@/components/appeals/AppealChatMessage';
import { STATUS_STYLES } from '@/components/admin/appeals/appealMeta';

export default function TranscriptDialog({ appeal, onClose }) {
  const [msgs, setMsgs] = useState(null);

  useEffect(() => {
    if (!appeal) return;
    setMsgs(null);
    base44.entities.AppealMessage.filter({ appeal_id: appeal.id }, 'created_date', 500).then((m) => setMsgs(m || []));
  }, [appeal]);

  const download = () => {
    const lines = [
      `Appeal transcript — ${appeal.roblox_username}`,
      `Status: ${appeal.status}  |  Submitted: ${new Date(appeal.created_date).toLocaleString()}`,
      `Handled by: ${appeal.assigned_to || '—'}`,
      '', `Appeal reason: ${appeal.appeal_reason}`,
      appeal.staff_response ? `Staff response: ${appeal.staff_response}` : '',
      '', '--- Chat ---',
      ...msgs.map((m) => `[${new Date(m.created_date).toLocaleString()}] ${m.sender_name || (m.sender_is_staff ? 'Staff' : m.roblox_username)}: ${m.message || ''}${m.image_uri ? ' [image]' : ''}`),
    ];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    a.download = `transcript-${appeal.roblox_username}-${appeal.id}.txt`;
    a.click();
  };

  return (
    <Dialog open={!!appeal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto border-white/10 bg-slate-950 text-white">
        {appeal && (
          <>
            <DialogTitle className="font-display flex items-center gap-2">
              Transcript · {appeal.roblox_username}
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[appeal.status] || ''}`}>{appeal.status}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 -mt-2">
              Submitted {new Date(appeal.created_date).toLocaleString()} · handled by {appeal.assigned_to || 'unassigned'}
            </DialogDescription>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2 text-sm">
              <div><span className="text-slate-500">Reason: </span>{appeal.appeal_reason}</div>
              {appeal.why_accepted && <div><span className="text-slate-500">Why accept: </span>{appeal.why_accepted}</div>}
              {appeal.staff_response && <div><span className="text-slate-500">Staff response: </span>{appeal.staff_response}</div>}
              {appeal.internal_notes && <div className="text-amber-200/80"><span className="text-slate-500">Internal notes: </span>{appeal.internal_notes}</div>}
            </div>
            {msgs === null ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading transcript…</div>
            ) : msgs.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No chat messages on this ticket.</p>
            ) : (
              <div className="space-y-2">{msgs.map((m) => <AppealChatMessage key={m.id} msg={m} mine={m.sender_is_staff} />)}</div>
            )}
            {msgs && (
              <button onClick={download} className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-white/15 bg-white/5 text-sm text-slate-200 hover:text-white">
                <Download className="h-4 w-4" /> Download transcript
              </button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}