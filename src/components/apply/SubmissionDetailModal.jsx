import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatAnswer, extractYouTubeId } from '@/lib/applicationTypes';
import { getRetakeState } from '@/lib/applicationRetake';
import { safeParse } from '@/lib/safeParse';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import {
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Calendar,
  Timer,
  Tag,
  Lock,
  UserCheck,
  MessageSquareQuote,
} from 'lucide-react';
import UploadedFileAttachment from '@/components/apply/UploadedFileAttachment';
import NewBadge from '@/components/ui/new-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_META = {
  submitted: {
    label: 'Submitted · Awaiting Review',
    shortLabel: 'Submitted',
    icon: Clock,
    color: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    strip: 'from-sky-500/20 via-cyan-500/5 to-transparent',
  },
  under_review: {
    label: 'Under Staff Review',
    shortLabel: 'Under Review',
    icon: Clock,
    color: 'text-violet-300',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/30',
    strip: 'from-violet-500/20 via-fuchsia-500/5 to-transparent',
  },
  accepted: {
    label: 'Accepted',
    shortLabel: 'Accepted',
    icon: CheckCircle2,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    strip: 'from-emerald-500/20 via-teal-500/5 to-transparent',
  },
  rejected: {
    label: 'Rejected',
    shortLabel: 'Rejected',
    icon: AlertCircle,
    color: 'text-rose-300',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
    strip: 'from-rose-500/20 via-orange-500/5 to-transparent',
  },
};

function normalizeStaffEmail(email) {
  if (!email) return '';
  return String(email).replace(/@staffwaitrose\.net/gi, '@escapetsunamifordevelopers.com');
}

function formatReviewerName(email) {
  const clean = normalizeStaffEmail(email);
  if (!clean) return 'Staff Reviewer';
  const handle = clean.split('@')[0] || clean;
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

function formatTurnaround(createdDate, reviewedAt) {
  if (!createdDate || !reviewedAt) return null;
  const diffMs = new Date(reviewedAt).getTime() - new Date(createdDate).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return null;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Under 1m';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

export default function SubmissionDetailModal({ response, allAttempts = [], onClose }) {
  const { user } = useAuth();
  const isStaffViewer = isOwner(user) || user?.role === 'admin' || user?.role === 'staff';
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [copiedAnswers, setCopiedAnswers] = useState(false);

  useEffect(() => {
    setActiveAttemptId(response?.id || null);
  }, [response?.id]);

  const currentResp = useMemo(() => {
    if (!response) return null;
    if (activeAttemptId && allAttempts.length > 0) {
      const found = allAttempts.find((a) => a.id === activeAttemptId);
      if (found) return { ...found, application: response.application };
    }
    return response;
  }, [response, activeAttemptId, allAttempts]);

  const questions = useMemo(() => {
    return safeParse(currentResp?.application?.questions, []).filter((q) => q.type !== 'section');
  }, [currentResp]);

  const settings = useMemo(() => {
    return safeParse(currentResp?.application?.settings, {});
  }, [currentResp]);

  const answers = useMemo(() => {
    return safeParse(currentResp?.answers, {});
  }, [currentResp]);

  const aiReview = useMemo(() => {
    return safeParse(currentResp?.ai_review, null);
  }, [currentResp]);

  if (!currentResp) return null;

  const meta = STATUS_META[currentResp.status] || STATUS_META.submitted;
  const StatusIcon = meta.icon;
  const reviewerEmail = normalizeStaffEmail(currentResp.reviewed_by);
  const reviewerName = formatReviewerName(currentResp.reviewed_by);
  const turnaround = formatTurnaround(currentResp.created_date, currentResp.reviewed_at);

  const answeredCount = questions.filter((q) => {
    const v = formatAnswer(q, answers[q.id]);
    return v !== null && v !== undefined && String(v).trim() !== '';
  }).length;

  const totalWords = questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (typeof raw === 'string' && raw.startsWith('file:')) return sum;
    const v = formatAnswer(q, raw);
    return sum + (v ? String(v).trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const retakeState = allAttempts.length
    ? getRetakeState(settings, allAttempts)
    : getRetakeState(settings, [currentResp]);

  const copyAllAnswers = () => {
    const text = questions
      .map((q, i) => `${i + 1}. ${q.text}\n${formatAnswer(q, answers[q.id]) || '(Skipped)'}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAnswers(true);
    setTimeout(() => setCopiedAnswers(false), 1800);
  };

  return (
    <Dialog open={!!response} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-[#0B0D13] border-white/10 text-white max-h-[88vh] overflow-y-auto p-0">
        {/* Top Branded Header Strip */}
        <div className={`bg-gradient-to-b ${meta.strip} border-b border-white/10 p-5 sm:p-6`}>
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${meta.bg} ${meta.border} border ${meta.color} text-xs font-semibold`}>
                  <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
                </div>
                {currentResp.starred && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Shortlisted
                  </span>
                )}
                {currentResp.retake_allowed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <RotateCcw className="h-3 w-3" /> Retake Granted
                  </span>
                )}
              </div>

              {allAttempts.length > 1 && (
                <div className="inline-flex items-center gap-1 bg-slate-950/80 border border-white/10 rounded-lg p-1">
                  {allAttempts.map((att, idx) => {
                    const num = att.attempt || allAttempts.length - idx;
                    const active = att.id === currentResp.id;
                    return (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setActiveAttemptId(att.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          active ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Attempt #{num}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-white pr-6">
              {currentResp.application_title || 'Application'}
            </DialogTitle>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                Submitted {new Date(currentResp.created_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              {currentResp.roblox_username && (
                <span className="inline-flex items-center gap-1 text-slate-300">
                  Applicant: <strong className="text-white">@{currentResp.roblox_username}</strong>
                </span>
              )}
              <span className="text-slate-600 font-mono text-[11px]">ID: #{String(currentResp.id).slice(-6).toUpperCase()}</span>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Staff Review & Decision Details Card */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Staff Review Details</span>
                <NewBadge />
              </div>
              {turnaround && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  <Timer className="h-3 w-3 text-cyan-400" /> Turnaround: {turnaround}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Review Status</div>
                <div className={`mt-1 text-sm font-semibold flex items-center gap-1.5 ${meta.color}`}>
                  <StatusIcon className="h-4 w-4 shrink-0" />
                  <span>{meta.shortLabel}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Attempt #{currentResp.attempt || 1}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Reviewed By</div>
                {reviewerEmail ? (
                  <>
                    <div className="mt-1 text-sm font-semibold text-white flex items-center gap-1.5 truncate">
                      <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{reviewerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate" title={reviewerEmail}>
                      {reviewerEmail}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-1 text-sm font-medium text-slate-400">Pending Staff Assignment</div>
                    <div className="text-[11px] text-slate-500">In review queue</div>
                  </>
                )}
              </div>

              <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Decision Timestamp</div>
                {currentResp.reviewed_at ? (
                  <>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {new Date(currentResp.reviewed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      at {new Date(currentResp.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-1 text-sm font-medium text-slate-400">Awaiting Decision</div>
                    <div className="text-[11px] text-slate-500">You will be notified by email</div>
                  </>
                )}
              </div>
            </div>

            {/* Staff Rating & Tags if present */}
            {(currentResp.staff_rating > 0 || (currentResp.tags && currentResp.tags.length > 0)) && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                {currentResp.staff_rating > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="text-slate-500">Reviewer Rating:</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${
                            currentResp.staff_rating >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-amber-300 font-semibold">({currentResp.staff_rating}/5)</span>
                  </div>
                )}
                {currentResp.tags?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {currentResp.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-200"
                      >
                        <Tag className="h-2.5 w-2.5" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Official Staff Feedback Banner */}
            {currentResp.applicant_feedback ? (
              <div className="rounded-xl bg-cyan-500/[0.07] border border-cyan-500/25 p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquareQuote className="h-4 w-4" /> Official Staff Feedback
                  </span>
                  {reviewerName && <span className="text-[11px] text-cyan-200/70">From {reviewerName}</span>}
                </div>
                <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">{currentResp.applicant_feedback}</p>
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.02] border border-white/5 px-3.5 py-2.5 text-xs text-slate-400">
                {currentResp.status === 'submitted'
                  ? 'No staff feedback posted yet — your application is currently in the review queue.'
                  : 'No additional written note was attached to this decision.'}
              </div>
            )}

            {/* Retake / Edit Action Strip for Applicant */}
            {currentResp.application && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-xs text-slate-400">
                  {retakeState?.canApply ? (
                    <span className="text-emerald-300 font-medium">✓ You are eligible to submit a new attempt for this application.</span>
                  ) : retakeState?.reason === 'cooldown' ? (
                    <span className="text-amber-300">Retake cooldown active until {retakeState.availableAt?.toLocaleString()}.</span>
                  ) : settings.allowEditing && currentResp.status === 'submitted' ? (
                    <span className="text-cyan-300">You can still edit your answers before staff review begins.</span>
                  ) : null}
                </div>
                {(retakeState?.canApply || (settings.allowEditing && currentResp.status === 'submitted')) && (
                  <Link
                    to={`/apply/${currentResp.application.slug || currentResp.application_id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {retakeState?.canApply ? 'Submit New Attempt' : 'Edit Submission'}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Staff-Only Internal Intelligence Panel */}
          {isStaffViewer && (
            <div className="rounded-2xl bg-violet-500/[0.06] border border-violet-500/25 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-violet-300" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">Staff-Only Internal Notes & AI Screening</span>
                  <NewBadge />
                </div>
                <Link
                  to={`/manage-applications?app=${currentResp.application_id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-white bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 rounded-lg"
                >
                  Open in Staff Review Board <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {currentResp.ai_score !== undefined && currentResp.ai_score !== null && (
                <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                      AI Score: <strong className="text-violet-300">{currentResp.ai_score}/100</strong>
                      {currentResp.ai_recommendation && (
                        <span className="ml-1 uppercase text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                          Rec: {currentResp.ai_recommendation}
                        </span>
                      )}
                    </span>
                    {aiReview?.subscores && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span>Effort: <strong className="text-white">{aiReview.subscores.effort}%</strong></span>
                        <span>Maturity: <strong className="text-white">{aiReview.subscores.maturity}%</strong></span>
                        <span>Authentic: <strong className="text-white">{aiReview.subscores.authenticity}%</strong></span>
                      </div>
                    )}
                  </div>
                  {currentResp.ai_summary && <p className="text-xs text-slate-300 leading-relaxed">{currentResp.ai_summary}</p>}
                </div>
              )}

              {currentResp.staff_notes ? (
                <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Private Staff Notes</div>
                  <p className="text-xs text-slate-200 whitespace-pre-wrap">{currentResp.staff_notes}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No private staff notes recorded on this submission.</p>
              )}
            </div>
          )}

          {/* Answers Header + Stats + Copy Button */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Submitted Answers</span>
                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  {answeredCount}/{questions.length} answered · {totalWords} words
                </span>
              </div>
              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={copyAllAnswers}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {copiedAnswers ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedAnswers ? 'Copied!' : 'Copy answers'}
                </button>
              )}
            </div>

            {questions.length === 0 ? (
              <p className="text-sm text-slate-500">Answer data is no longer available.</p>
            ) : (
              questions.map((q, i) => {
                const rawVal = answers[q.id];
                const val = formatAnswer(q, rawVal);
                const isFile = (q.type === 'file' || q.type === 'screenshot') && typeof rawVal === 'string' && rawVal.startsWith('file:');
                return (
                  <div key={q.id || i} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-400">
                          {q.text}
                          {q.required && <span className="text-rose-400 ml-1">*</span>}
                        </div>
                        {!val ? (
                          <div className="mt-1 text-sm italic text-slate-600">{q.required ? 'Not answered' : 'Skipped'}</div>
                        ) : isFile ? (
                          <div className="mt-2">
                            <UploadedFileAttachment value={rawVal} />
                          </div>
                        ) : q.type === 'rating' ? (
                          <div className="mt-1.5 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`h-4 w-4 ${rawVal >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                              />
                            ))}
                          </div>
                        ) : q.type === 'code' ? (
                          <pre className="mt-1.5 text-xs text-emerald-300 bg-slate-950/90 border border-white/10 rounded-xl p-3 font-mono whitespace-pre-wrap break-words overflow-x-auto">
                            {val}
                          </pre>
                        ) : (
                          <div className="mt-1 text-sm text-white whitespace-pre-wrap break-words leading-relaxed">
                            {val}
                            {q.type === 'youtube' && extractYouTubeId(val) && (
                              <div className="mt-2 aspect-video w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black">
                                <iframe
                                  src={`https://www.youtube.com/embed/${extractYouTubeId(val)}`}
                                  title={q.text || 'Submitted YouTube video'}
                                  className="h-full w-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}