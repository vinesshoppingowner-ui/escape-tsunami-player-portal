import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Loader2, CheckCircle2, AlertTriangle, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function OwnershipSupportModal({ open, onOpenChange, supportEmail }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setTimeout(() => {
        setError('');
        setTicketId('');
      }, 200);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('submitOwnershipSupport', {
        subject: subject.trim(),
        message: message.trim(),
      });
      if (res?.data?.ok) {
        setTicketId(res.data.ticket_id || 'SUBMITTED');
        setSubject('');
        setMessage('');
      } else {
        setError(res?.data?.error || 'Could not send your support request.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send your support request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0d1122] border border-cyan-500/25 text-white max-w-lg">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-1">
            Ownership Support Only
          </div>
          <DialogTitle className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-cyan-400" />
            Contact Ownership Support
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Your message goes directly to <span className="text-cyan-300">{supportEmail}</span> and you will automatically receive an email confirmation receipt.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 text-center space-y-3">
            <p className="text-sm text-slate-300">
              Sign in to your portal account so we can verify your email and send your automatic confirmation receipt.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                to="/login?returnTo=%2F"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In to Message Ownership
              </Link>
            </div>
          </div>
        ) : ticketId ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-5 text-center space-y-3">
            <CheckCircle2 className="h-9 w-9 text-emerald-400 mx-auto" />
            <h4 className="font-display text-lg font-bold text-white">Request Received ({ticketId})</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We sent an automatic confirmation email to <strong className="text-white">{user.email}</strong> and forwarded your inquiry to Ownership (<span className="text-cyan-300">{supportEmail}</span>).
            </p>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="text-xs text-slate-400 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
              <span>Replying to: <strong className="text-slate-200">{user.email}</strong></span>
              <span className="text-[11px] text-emerald-400">Auto-reply enabled</span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Subject</label>
              <input
                type="text"
                required
                maxLength={160}
                placeholder="Brief summary of your ownership inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Message to Ownership</label>
              <textarea
                rows={4}
                required
                maxLength={4000}
                placeholder="Explain how Ownership can help..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !subject.trim() || !message.trim()}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send & Get Receipt
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}