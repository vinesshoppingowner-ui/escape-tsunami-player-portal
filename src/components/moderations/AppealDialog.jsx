import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldAlert, Calendar, Clock, UserCog, X } from 'lucide-react';

const MIN_CHARS = 20;
const MAX_CHARS = 500;

export default function AppealDialog({ open, onClose, moderation, robloxUsername, onSubmit }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setReason('');
      setSubmitting(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (reason.trim().length < MIN_CHARS || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const count = reason.trim().length;
  const tooShort = count > 0 && count < MIN_CHARS;
  const canSubmit = count >= MIN_CHARS && count <= MAX_CHARS && !submitting;

  const meta = [
    moderation?.moderation_date && { icon: Calendar, label: new Date(moderation.moderation_date).toLocaleDateString() },
    moderation?.duration && { icon: Clock, label: moderation.duration },
    moderation?.staff_member && { icon: UserCog, label: moderation.staff_member },
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-white/15 text-white sm:max-w-lg p-0 flex flex-col gap-0 max-h-[90vh] overflow-y-auto">
        {/* Header band with close button */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DialogTitle className="text-xl font-semibold mt-4">Appeal your moderation</DialogTitle>
          <DialogDescription className="text-slate-400 mt-1.5 leading-relaxed">
            Explain why this {moderation?.moderation_type?.toLowerCase() || 'moderation'} should be reviewed or lifted. Be honest and respectful — your appeal goes straight to the staff team.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-5">
          {/* Moderation context */}
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
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

          {/* Appeal input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="appeal-reason" className="text-sm font-medium text-white">Your appeal</label>
              <span className={`text-xs font-mono ${tooShort ? 'text-amber-400' : count >= MIN_CHARS ? 'text-emerald-400' : 'text-slate-500'}`}>
                {count}/{MAX_CHARS}
              </span>
            </div>
            <Textarea
              id="appeal-reason"
              ref={textareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
              }}
              placeholder="Tell us what happened, why the decision should be reconsidered, or any context the staff may have missed…"
              maxLength={MAX_CHARS}
              rows={6}
              className="bg-slate-900/60 border-white/15 text-white placeholder:text-slate-500 resize-none focus-visible:ring-cyan-500/40"
            />
            {tooShort ? (
              <p className="text-xs text-amber-400/90">Add a little more detail so the staff can review your appeal properly.</p>
            ) : (
              <p className="text-xs text-slate-500">Tip: press ⌘/Ctrl + Enter to submit.</p>
            )}
          </div>

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