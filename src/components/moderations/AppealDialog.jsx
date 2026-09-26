import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AppealField from '@/components/moderations/AppealField';
import { Loader2, ShieldAlert, Calendar, Clock, UserCog } from 'lucide-react';

const MIN_CHARS = 20;
const MAX_CHARS = 500;

export default function AppealDialog({ open, onClose, moderation, robloxUsername, onSubmit }) {
  const [reason, setReason] = useState('');
  const [whyAccepted, setWhyAccepted] = useState('');
  const [deserved, setDeserved] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setReason('');
      setWhyAccepted('');
      setDeserved('');
      setSubmitting(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (reason.trim().length < MIN_CHARS || whyAccepted.trim().length < MIN_CHARS || deserved.trim().length < MIN_CHARS || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        appeal_reason: reason.trim(),
        why_accepted: whyAccepted.trim(),
        deserved_infraction: deserved.trim(),
      });
      setReason('');
      setWhyAccepted('');
      setDeserved('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const count1 = reason.trim().length;
  const count2 = whyAccepted.trim().length;
  const count3 = deserved.trim().length;
  const type = moderation?.moderation_type || '';
  const tint = type.includes('Ban')
    ? 'bg-red-500/10 border-red-500/20'
    : type === 'Kick'
    ? 'bg-orange-500/10 border-orange-500/20'
    : 'bg-amber-500/10 border-amber-500/20';
  const canSubmit = count1 >= MIN_CHARS && count1 <= MAX_CHARS
    && count2 >= MIN_CHARS && count2 <= MAX_CHARS
    && count3 >= MIN_CHARS && count3 <= MAX_CHARS
    && !submitting;

  const meta = [
    moderation?.moderation_date && { icon: Calendar, label: new Date(moderation.moderation_date).toLocaleDateString() },
    moderation?.duration && { icon: Clock, label: moderation.duration },
    moderation?.staff_member && { icon: UserCog, label: moderation.staff_member },
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-white/10 text-white sm:max-w-2xl p-0 flex flex-col gap-0 max-h-[95vh] overflow-y-auto">
        <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-start gap-3 pr-12">
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold">Appeal your moderation</DialogTitle>
            <DialogDescription className="text-sm text-slate-400 mt-0.5">
              Be honest and respectful — your appeal goes straight to the staff team.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Moderation context */}
          <div className={`rounded-md border p-3.5 ${tint}`}>
            <div className="text-slate-500 text-[11px] uppercase tracking-wider font-medium">Moderation</div>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold">{moderation?.moderation_type}</span>
              {moderation?.reason && <span className="text-slate-400">— {moderation.reason}</span>}
            </div>
            {meta.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {meta.map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <m.icon className="h-3.5 w-3.5 text-slate-500" /> {m.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <AppealField
            id="appeal-reason"
            ref={textareaRef}
            label="1. Explain what happened"
            value={reason}
            onChange={setReason}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(); }}
            placeholder="Context or details about the incident…"
            min={MIN_CHARS}
            max={MAX_CHARS}
            rows={3}
          />
          <AppealField id="appeal-why" label="2. Why should your appeal be accepted?" value={whyAccepted} onChange={setWhyAccepted} min={MIN_CHARS} max={MAX_CHARS} />
          <AppealField id="appeal-deserved" label="3. Did you deserve this infraction in your opinion?" value={deserved} onChange={setDeserved} min={MIN_CHARS} max={MAX_CHARS} />

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500">Appealing as <span className="text-cyan-300 font-medium">{robloxUsername}</span></p>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : 'Submit appeal'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}