import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Loader2, CheckCircle2, AlertTriangle, ExternalLink, Shield, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import SiteNav from '@/components/SiteNav';

export default function SupportReplyPage() {
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get('ticket') || 'OWN-SUPPORT';
  const toEmail = params.get('to') || '';
  const playerName = params.get('name') || toEmail || 'Player';
  const subjectLine = params.get('subject') || 'Ownership Support Inquiry';
  const originalMsg = params.get('msg') || '';

  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const allowed = isOwner(user) || user?.role === 'staff';
  const mode = params.get('mode') || '';

  const gmailComposeUrl = toEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(`Re: ${subjectLine} (${ticketId})`)}&body=${encodeURIComponent(
        `Hi ${playerName},\n\n\n\n---\nTicket ${ticketId}: "${subjectLine}"\n${originalMsg}`
      )}`
    : null;

  useEffect(() => {
    document.title = `Reply to ${playerName} · Ownership Support`;
    if (mode === 'gmail' && gmailComposeUrl) {
      window.location.replace(gmailComposeUrl);
    }
  }, [playerName, mode, gmailComposeUrl]);

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await base44.functions.invoke('submitOwnershipSupport', {
        action: 'staff_reply',
        to_email: toEmail,
        ticket_id: ticketId,
        subject: subjectLine,
        reply_message: replyMessage.trim(),
      });
      if (res?.data?.ok) {
        setSent(true);
      } else {
        setError(res?.data?.error || 'Could not send reply.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send reply.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <div className="rounded-2xl bg-[#0d1122] border border-cyan-500/25 p-6 sm:p-8 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-3">
            <Shield className="h-3 w-3" /> Ownership Support Reply · {ticketId}
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Reply Directly to {playerName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sending to <span className="text-cyan-300 font-medium">{toEmail || 'No email specified'}</span>
          </p>

          <div className="mt-5 rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-1.5">
            <div className="text-xs text-slate-400">
              <strong className="text-slate-200">Subject:</strong> {subjectLine}
            </div>
            {originalMsg && (
              <div className="text-xs text-slate-300 pt-1 border-t border-white/5 whitespace-pre-wrap">
                {originalMsg}
              </div>
            )}
          </div>

          {!allowed ? (
            <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 text-xs text-amber-200">
              Only signed-in Ownership or Staff members can send branded portal replies. You can also click below to compose directly to <strong>{toEmail}</strong> in Gmail.
              {gmailComposeUrl && (
                <div className="mt-3">
                  <a
                    href={gmailComposeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Compose to {toEmail} in Gmail
                  </a>
                </div>
              )}
            </div>
          ) : sent ? (
            <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-5 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="font-display text-lg font-bold text-white">Reply Sent to {toEmail}</h3>
              <p className="text-xs text-slate-300">
                Your branded Ownership Support response for ticket <strong>{ticketId}</strong> has been emailed directly to {playerName}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="mt-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Your Official Ownership Response</label>
                <textarea
                  rows={5}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Write your reply to ${playerName}...`}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {gmailComposeUrl && (
                  <a
                    href={gmailComposeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Or Reply in Gmail directly to {toEmail}
                  </a>
                )}
                <button
                  type="submit"
                  disabled={sending || !replyMessage.trim() || !toEmail}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending Reply...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send Branded Reply to Player
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}