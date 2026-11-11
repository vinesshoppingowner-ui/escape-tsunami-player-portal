import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Star, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { RESPONSE_STATUS } from '@/lib/applicationTypes';
import { isNewSubmission } from '@/hooks/useLiveApplications';
import { sendApplicationUpdateEmail } from '@/lib/userEmails';
import { safeParse } from '@/lib/safeParse';
import ResponseAnswers from './ResponseAnswers';
import ResponseAIPanel from './ResponseAIPanel';
import ResponseDecisionPanel from './ResponseDecisionPanel';
import ApplicantContextCard from './ApplicantContextCard';
import StaffReviewToolkit from './StaffReviewToolkit';
import AdminExecutiveActions, { isStrictAdmin } from './AdminExecutiveActions';

export default function ResponseViewer({ responses, index, application, onIndex, onClose, onUpdate, onDelete }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [injectedFeedback, setInjectedFeedback] = useState(null);
  const response = responses[index];

  const toggleStar = async () => {
    if (!response) return;
    try {
      const updated = await base44.entities.ApplicationResponse.update(response.id, { starred: !response.starred });
      onUpdate(updated);
    } catch {}
  };

  // Bug 1 fix: Quick status via keyboard shortcuts now properly sets reviewed_by, creates Notification, emails applicant, and syncs to Google Sheet
  const quickStatus = async (status) => {
    if (!response || response.status === status) return;
    const revObj = safeParse(response.ai_review, {});
    if (revObj.admin_decision_locked && !isStrictAdmin(user)) {
      toast({ title: 'Decision locked by an Administrator', variant: 'destructive' });
      return;
    }
    try {
      const prevStatus = response.status;
      const updated = await base44.entities.ApplicationResponse.update(response.id, {
        status,
        reviewed_by: user?.email || '',
        reviewed_at: new Date().toISOString(),
      });
      onUpdate(updated);
      toast({ title: `Marked as ${RESPONSE_STATUS[status]?.label || status}` });
      if (response.roblox_username) {
        const decided = status === 'accepted' || status === 'rejected';
        base44.entities.Notification.create({
          roblox_username: response.roblox_username,
          title: decided ? `Application ${status}` : `Application status: ${RESPONSE_STATUS[status]?.label || status}`,
          body: decided
            ? `Your application for "${application.title}" was ${status}.`
            : `Your application for "${application.title}" is now ${RESPONSE_STATUS[status]?.label || status}.`,
          type: 'staff_message',
          read: false,
        }).catch(() => {});
      }
      sendApplicationUpdateEmail({
        response: updated,
        application,
        eventType: 'status_update',
        previousStatus: prevStatus,
      }).catch(() => {});
      base44.functions.invoke('syncApplicationToSheet', { response_id: response.id }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    const onKey = (e) => {
      if (['TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < responses.length - 1) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      if (e.key.toLowerCase() === 's') toggleStar();
      if (e.key.toLowerCase() === 'a') quickStatus('accepted');
      if (e.key.toLowerCase() === 'r') quickStatus('rejected');
      if (e.key.toLowerCase() === 'u') quickStatus('under_review');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!response) return null;
  const questions = safeParse(application.questions, []);
  const answers = safeParse(response.answers, {});
  const st = RESPONSE_STATUS[response.status] || RESPONSE_STATUS.submitted;
  const isNew = isNewSubmission(response.created_date);
  const sameUserAttempts = responses.filter(
    (r) => r.roblox_username && r.roblox_username.toLowerCase() === (response.roblox_username || '').toLowerCase()
  );
  const previousAttempt = sameUserAttempts.find((r) => r.id !== response.id && (r.attempt || 1) < (response.attempt || 1)) || sameUserAttempts.find((r) => r.id !== response.id);
  const previousAttemptAnswers = previousAttempt ? safeParse(previousAttempt.answers, null) : null;
  const navBtn = 'p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30';

  const handleNextUnreviewed = (currentId) => {
    const nextIdx = responses.findIndex((r, idx) => idx !== index && r.id !== currentId && r.status === 'submitted');
    if (nextIdx >= 0) onIndex(nextIdx);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 flex items-center gap-3">
          <RobloxAvatar username={response.roblox_username} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{response.roblox_username || 'Unknown'}</h3>
              {isNew && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse">
                  <Sparkles className="h-2.5 w-2.5" /> New
                </span>
              )}
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
              {response.attempt > 1 && <span className="inline-flex items-center gap-1 text-[11px] text-amber-300"><RotateCcw className="h-3 w-3" /> Attempt {response.attempt}</span>}
              {response.roblox_username && <Link to={`/admin/player/${response.roblox_username}`} className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white">Player profile <ExternalLink className="h-3 w-3" /></Link>}
            </div>
            <p className="text-xs text-slate-500 truncate">{response.submitted_by_email} · {new Date(response.created_date).toLocaleString()}</p>
          </div>

          {sameUserAttempts.length > 1 && (
            <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg p-1">
              {sameUserAttempts.map((att) => {
                const attIdx = responses.findIndex((x) => x.id === att.id);
                const active = att.id === response.id;
                return (
                  <button
                    key={att.id}
                    onClick={() => attIdx >= 0 && onIndex(attIdx)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      active ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    #{att.attempt || 1}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={toggleStar}
            title="Shortlist / Star (S)"
            className={`p-2 rounded-lg border transition-colors ${
              response.starred ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className={`h-4 w-4 ${response.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <span className="hidden sm:block text-xs text-slate-500">{index + 1} / {responses.length}</span>
          <button className={navBtn} disabled={index === 0} onClick={() => onIndex(index - 1)} title="Previous (←)"><ChevronLeft className="h-4 w-4" /></button>
          <button className={navBtn} disabled={index === responses.length - 1} onClick={() => onIndex(index + 1)} title="Next (→)"><ChevronRight className="h-4 w-4" /></button>
          <button className={navBtn} onClick={onClose} title="Close (Esc)"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
          <ResponseAnswers
            questions={questions}
            answers={answers}
            responseId={response.id}
            response={response}
            allResponses={responses}
            onUpdate={onUpdate}
            previousAttemptAnswers={previousAttemptAnswers}
          />
          <div className="space-y-4 lg:sticky lg:top-24">
            <AdminExecutiveActions response={response} application={application} onUpdate={onUpdate} />
            <ApplicantContextCard username={response.roblox_username} currentResponseId={response.id} />
            <StaffReviewToolkit response={response} application={application} onUpdate={onUpdate} />
            <ResponseAIPanel
              response={response}
              application={application}
              onUpdate={onUpdate}
              onApplySuggestedFeedback={(text, rec) => {
                const mapRec = rec === 'accept' ? 'accepted' : rec === 'reject' ? 'rejected' : 'under_review';
                setInjectedFeedback({ text, status: mapRec, ts: Date.now() });
              }}
            />
            <ResponseDecisionPanel
              response={response}
              application={application}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onNextUnreviewed={handleNextUnreviewed}
              injectedFeedback={injectedFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  );
}