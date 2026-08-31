import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AppealDialog({ open, onClose, moderation, robloxUsername, onSubmit }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/15 text-white sm:max-w-lg">
        <DialogHeader>
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          </div>
          <DialogTitle className="text-xl">Appeal your moderation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Explain why this {moderation?.moderation_type?.toLowerCase()} should be reviewed or lifted. Be honest and respectful — your appeal goes straight to the staff team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3 text-sm">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Moderation</div>
            <div className="text-white font-medium mt-0.5">{moderation?.moderation_type} — {moderation?.reason}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-reason" className="text-slate-200">Your appeal</Label>
            <Textarea
              id="appeal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us what happened, why the decision should be reconsidered, or any context the staff may have missed…"
              rows={5}
              className="bg-slate-950/50 border-white/15 text-white placeholder:text-slate-500 resize-none"
            />
            <p className="text-xs text-slate-500">Appealing as <span className="text-cyan-300 font-medium">{robloxUsername}</span></p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
          >
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : 'Submit appeal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}