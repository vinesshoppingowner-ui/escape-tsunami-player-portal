import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Send, CheckCircle2, FileQuestion, Lock, ClipboardCheck, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ApplyField from '@/components/apply/ApplyField';
import ApplyReview from '@/components/apply/ApplyReview';
import ApplyStepper from '@/components/apply/ApplyStepper';
import ApplyStatusScreen from '@/components/apply/ApplyStatusScreen';
import { formatAnswer } from '@/lib/applicationTypes';
import ApplyLogin from '@/components/apply/ApplyLogin';
import RespondingAs from '@/components/apply/RespondingAs';
import AppIcon from '@/components/apply/AppIcon';
import { getRetakeState } from '@/lib/applicationRetake';
import { runAIReview } from '@/lib/applicationAI';
import { evalShowIf, validateField, readPrefillParams } from '@/lib/formLogic';
import { isObjectId } from '@/lib/applicationSlug';
import { Ban } from 'lucide-react';

const isEmpty = (a) => a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0);

export default function Apply() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [app, setApp] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState({});
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(-1); // -1 intro, 0..n-1 questions, n review
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [myResponses, setMyResponses] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [blacklisted, setBlacklisted] = useState(false);
  const retake = getRetakeState(settings, myResponses);

  useEffect(() => {
    (async () => {
      try {
        // Look up by slug first, fall back to ObjectId
        let a;
        if (!isObjectId(id)) {
          const slugPage = await base44.entities.Application.filter({ slug: id }, { limit: 1 });
          a = slugPage?.items?.[0];
        }
        if (!a) a = await base44.entities.Application.get(id);

        setApp(a);
        const s = JSON.parse(a.settings || '{}');
        const qs = JSON.parse(a.questions || '[]');
        setQuestions(s.shuffleQuestions ? [...qs].sort(() => Math.random() - 0.5) : qs);
        setSettings(s);
        // Pre-fill from URL params (?q_<questionId>=value)
        const prefill = readPrefillParams(qs);
        if (Object.keys(prefill).length) setAnswers((prev) => ({ ...prefill, ...prev }));

        if (user?.id) {
          const mine = await base44.entities.ApplicationResponse.filter({ application_id: a.id, created_by_id: user.id }, { sort: '-created_date', limit: 50 });
          setMyResponses(mine?.items || []);

          // Check blacklist
          const identifiers = [user.email, user.roblox_username, user.data?.roblox_username].filter(Boolean).map((v) => v.toLowerCase());
          if (identifiers.length) {
            const blPage = await base44.entities.ApplicationBlacklist.filter({ identifier: { $in: identifiers } }, { limit: 1 });
            if (blPage?.items?.length) setBlacklisted(true);
          }
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [id, user?.id]);

  // Questions visible after conditional logic evaluation
  const visibleQuestions = questions.filter((q) => evalShowIf(q, answers));

  const draftKey = `apply-draft-${id}-${user?.id || 'anon'}`;
  useEffect(() => {
    if (settings.disableAutosave) return;
    const saved = localStorage.getItem(draftKey);
    if (saved) setAnswers(JSON.parse(saved));
  }, [draftKey, settings.disableAutosave]);
  useEffect(() => {
    if (!settings.disableAutosave && !editingId && Object.keys(answers).length) localStorage.setItem(draftKey, JSON.stringify(answers));
  }, [answers, draftKey]);

  const total = visibleQuestions.length;
  const current = step >= 0 && step < total ? visibleQuestions[step] : null;
  const singlePage = total > 0 && total < 5 && settings.singlePageMode !== false;

  const validateQuestion = (q) => validateField(q, answers[q.id]);

  const goNext = () => {
    if (current && !singlePage) {
      const err = validateQuestion(current);
      if (err) { setError(err); return; }
    }
    setError('');
    setStep((s) => Math.min(s + 1, singlePage ? total : total));
  };
  const goBack = () => { setError(''); setStep((s) => Math.max(s - 1, -1)); };

  const submit = async () => {
    const firstBad = visibleQuestions.findIndex((q) => validateQuestion(q));
    if (firstBad !== -1) { setStep(singlePage ? 0 : firstBad); setError(validateQuestion(visibleQuestions[firstBad])); return; }
    if (!termsAccepted) { setError('Please accept the terms before submitting.'); return; }
    setSubmitting(true);
    try {
      let ai = {};
      if (settings.aiReviewEnabled) {
        ai = await runAIReview(app, answers).catch(() => ({}));
      }
      if (editingId) {
        await base44.entities.ApplicationResponse.update(editingId, { answers: JSON.stringify(answers), ...ai });
      } else {
      await base44.entities.ApplicationResponse.create({
        application_id: app.id,
        application_title: app.title,
        roblox_username: user?.roblox_username || user?.data?.roblox_username || '',
        submitted_by_email: settings.collectEmail === false ? '' : (user?.email || ''),
        answers: JSON.stringify(answers),
        status: 'submitted',
        attempt: retake.attempt,
        ...ai,
      });
      }
      if (settings.sendCopy && user?.email) {
        const body = questions.map((q) => `<p><b>${q.text}</b><br/>${formatAnswer(q, answers[q.id]) || '—'}</p>`).join('');
        base44.integrations.Core.SendEmail({ to: user.email, subject: `Your response: ${app.title}`, body }).catch(() => {});
      }
      // Discord webhook alert — fire-and-forget, never blocks submission
      if (settings.discordAlert !== false) {
        base44.functions.invoke('discordSend', {
          message: `New application submitted for **${app.title}** by ${user?.roblox_username || user?.email || 'Unknown'} (attempt ${retake.attempt}).`,
        }).catch(() => {});
      }
      localStorage.removeItem(draftKey);
      setSubmitted(true);
    } catch (e) {
      toast({ title: 'Failed to submit', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Block copy/paste/right-click/text-selection when the setting is enabled (default on)
  const formRef = useRef(null);
  useEffect(() => {
    if (settings.blockCopyPaste === false) return;
    const isInsideForm = (target) => formRef.current && formRef.current.contains(target);

    const blockEvent = (e) => {
      if (isInsideForm(e.target)) e.preventDefault();
    };
    const blockKeys = (e) => {
      if (!isInsideForm(e.target)) return;
      const k = (e.key || '').toLowerCase();
      // Block Ctrl/Cmd+C, X, V, A, S, P, U and dev-tool shortcuts
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a', 's', 'p', 'u', 'i', 'j'].includes(k)) e.preventDefault();
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(k))) e.preventDefault();
    };

    // Override Clipboard API so browser extensions can't programmatically copy
    const clip = navigator.clipboard;
    const origWrite = clip?.writeText;
    const origRead = clip?.readText;
    if (clip) {
      Object.defineProperty(clip, 'writeText', { value: () => Promise.reject(new Error('blocked')), configurable: true, writable: true });
      Object.defineProperty(clip, 'readText', { value: () => Promise.reject(new Error('blocked')), configurable: true, writable: true });
    }

    // Attach to document (capture phase) so right-click → paste is caught too
    const events = ['copy', 'cut', 'paste', 'contextmenu', 'selectstart', 'dragstart'];
    events.forEach((ev) => document.addEventListener(ev, blockEvent, true));
    document.addEventListener('keydown', blockKeys, true);

    return () => {
      events.forEach((ev) => document.removeEventListener(ev, blockEvent, true));
      document.removeEventListener('keydown', blockKeys, true);
      if (clip) {
        if (origWrite) Object.defineProperty(clip, 'writeText', { value: origWrite, configurable: true, writable: true });
        if (origRead) Object.defineProperty(clip, 'readText', { value: origRead, configurable: true, writable: true });
      }
    };
  }, [settings.blockCopyPaste]);

  useEffect(() => {
    const onKey = (e) => {
      // Ctrl/Cmd+Enter submits from anywhere in the form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (step >= total && total > 0) submit();
        return;
      }
      if (e.key !== 'Enter' || e.shiftKey || e.target.tagName === 'TEXTAREA') return;
      if (step >= 0 && step < total) { e.preventDefault(); goNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex items-center justify-center pt-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin text-cyan-400 mr-2" /> Loading application…</div>
      </div>
    );
  }
  if (!app) return <ApplyStatusScreen icon={FileQuestion} tone="slate" title="Application not found">This link may be broken or the application was removed.</ApplyStatusScreen>;
  if (!user) return <ApplyLogin app={app} />;
  if (blacklisted) return <ApplyStatusScreen icon={Ban} tone="rose" title="You are restricted">You are not permitted to submit applications. If you believe this is an error, contact a staff member.</ApplyStatusScreen>;
  const allowed = (settings.allowedUsers || []).map((u) => u.toLowerCase());
  const me = [user.email, user.roblox_username, user.data?.roblox_username].filter(Boolean).map((v) => v.toLowerCase());
  if (settings.restrictToUsers && allowed.length && !me.some((v) => allowed.includes(v))) return <ApplyStatusScreen icon={Lock} tone="rose" title="Invite only">"{app.title}" is only open to selected users.</ApplyStatusScreen>;
  const pastClose = app.auto_close_at && new Date(app.auto_close_at) < new Date();
  const limitHit = settings.responseLimit > 0 && (app.response_count || 0) >= settings.responseLimit;
  if (!submitted && (pastClose || limitHit)) return <ApplyStatusScreen icon={Lock} tone="rose" title="Applications closed">"{app.title}" is no longer accepting responses.</ApplyStatusScreen>;
  if (settings.requireRobloxVerification && !(user?.roblox_username || user?.data?.roblox_username)) return <ApplyStatusScreen icon={Lock} tone="cyan" title="Verification required">Link and verify your Roblox account in the portal before applying to "{app.title}".</ApplyStatusScreen>;
  const ageDays = user?.created_date ? (Date.now() - new Date(user.created_date)) / 86400000 : 0;
  if (settings.minAccountAgeDays > 0 && ageDays < settings.minAccountAgeDays) return <ApplyStatusScreen icon={Clock} tone="cyan" title="Account too new">Your account must be at least {settings.minAccountAgeDays} days old to apply to "{app.title}".</ApplyStatusScreen>;
  if (app.status !== 'open') return <ApplyStatusScreen icon={Lock} tone="rose" title="Applications closed">"{app.title}" is not currently accepting responses.</ApplyStatusScreen>;
  if (submitted) return <ApplyStatusScreen icon={CheckCircle2} tone="emerald" title="Application submitted!">{app.success_message || 'Your response has been recorded.'}
    {settings.showResultsSummary && <p className="mt-3 text-sm text-slate-500">{(app.response_count || 0) + (editingId ? 0 : 1)} responses submitted so far.</p>}
    {settings.showSubmitAnother && !settings.oneResponsePerUser && <button onClick={() => { setAnswers({}); setEditingId(null); setSubmitted(false); }} className="mt-4 text-sm text-cyan-300 hover:underline">Submit another response</button>}
  </ApplyStatusScreen>;
  if (!retake.canApply && !editingId && !submitted) {
    const status = <span className="text-cyan-300 capitalize">{retake.latest.status.replace('_', ' ')}</span>;
    return (
      <ApplyStatusScreen icon={Clock} tone="cyan" title={retake.reason === 'cooldown' ? 'Retake on cooldown' : retake.reason === 'max' ? 'No attempts left' : "You've already applied"}>
        {retake.reason === 'cooldown' && <>You can retake "{app.title}" on <span className="text-cyan-300">{retake.availableAt.toLocaleString()}</span>.</>}
        {retake.reason === 'max' && <>You've used all {settings.maxAttempts} attempts for "{app.title}".</>}
        {retake.reason === 'applied' && <>Your response to "{app.title}" is {status}. Check the Applications page for status updates.</>}
        {settings.allowEditing && retake.latest.status === 'submitted' && (
          <button onClick={() => { setAnswers(JSON.parse(retake.latest.answers || '{}')); setEditingId(retake.latest.id); }} className="mt-4 block mx-auto px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm">Edit your response</button>
        )}
        {retake.latest.applicant_feedback && <p className="mt-4 text-sm text-slate-300 rounded-xl bg-white/5 border border-white/10 p-3 text-left"><span className="text-slate-500">Staff feedback: </span>{retake.latest.applicant_feedback}</p>}
      </ApplyStatusScreen>
    );
  }

  const answered = questions.filter((q) => !isEmpty(answers[q.id])).length;
  const progress = step < 0 ? 0 : step >= total ? 100 : (step / total) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="max-w-2xl mx-auto px-5 pt-16 pb-24">
        <div className="flex items-center justify-between mb-4">
          <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /> All applications</Link>
          <div className="text-xs text-slate-500">{Object.keys(answers).length > 0 && <span className="text-emerald-400/80 mr-3">Draft saved</span>}{step < 0 ? `${total} question${total !== 1 ? 's' : ''}` : singlePage ? 'All questions' : step >= total ? 'Review' : `Question ${step + 1} of ${total}`}</div>
        </div>

        {settings.showProgressBar === false ? <div className="mb-8" /> : step < 0 ? (
          <div className="h-1.5 rounded-full bg-white/5 mb-8" />
        ) : singlePage ? (
          <div className="h-1.5 rounded-full bg-white/5 mb-8 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${total ? (questions.filter((q) => !isEmpty(answers[q.id])).length / total) * 100 : 0}%` }} />
          </div>
        ) : (
          <ApplyStepper questions={visibleQuestions} answers={answers} step={step} onJump={(i) => { setError(''); setStep(i); }} />
        )}

        <div ref={formRef} className={`${settings.blockCopyPaste === false ? '' : 'apply-no-select'} rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-10 overflow-hidden`}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              {step < 0 && (
                <div className="text-center">
                  <div className="mb-4 flex justify-center"><AppIcon icon={app.icon} className="h-20 w-20" emojiClass="text-6xl" /></div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">{app.category || 'Application'}</div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{app.title}</h1>
                  {app.description && <p className="mt-4 text-slate-400 leading-relaxed">{app.description}</p>}
                  <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">{visibleQuestions.length} questions</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">~{Math.max(1, Math.ceil(total * 0.75))} min</span>
                    {user && <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Applying as {user.roblox_username || user.email}</span>}
                    {retake.attempt > 1 && <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-200">Attempt #{retake.attempt}</span>}
                    {app.auto_close_at && (() => {
                      const diff = new Date(app.auto_close_at) - Date.now();
                      if (diff <= 0) return null;
                      const days = Math.ceil(diff / 86400000);
                      return <span className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300">Closes {days <= 1 ? 'today' : `in ${days} days`}</span>;
                    })()}
                  </div>
                  {retake.latest?.applicant_feedback && (
                    <p className="mt-4 text-sm text-slate-300 rounded-xl bg-white/5 border border-white/10 p-3 text-left"><span className="text-slate-500">Feedback from last attempt: </span>{retake.latest.applicant_feedback}</p>
                  )}
                  <Button onClick={goNext} size="lg" className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-12 px-8">{Object.keys(answers).length ? 'Continue application' : 'Start application'} <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              )}

              {singlePage && step >= 0 && step < total && (
                <div className="space-y-8">
                  {visibleQuestions.map((q, i) => (
                    <div key={q.id} className="border-b border-white/5 pb-6 last:border-0">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 text-sm font-bold shrink-0">{i + 1}</span>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-white leading-snug">{q.text}{q.required && <span className="text-rose-400 ml-1">*</span>}</h2>
                          {q.description && <p className="mt-1 text-sm text-slate-400">{q.description}</p>}
                        </div>
                      </div>
                      <ApplyField q={q} value={answers[q.id]} onChange={(v) => { setError(''); setAnswers({ ...answers, [q.id]: v }); }} />
                    </div>
                  ))}
                  {error && <div className="flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" /> {error}</div>}
                  <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-white/[0.03] border border-white/10 p-4">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 shrink-0" />
                    <span className="text-xs text-slate-400 leading-relaxed">I confirm my answers are my own original work. I have not used AI assistance, copied from others, or shared these questions unless explicitly permitted. Submitting false or plagiarized content may result in immediate rejection and a ban from future applications.</span>
                  </label>
                  <div className="pl-1"><RespondingAs user={user} /></div>
                  <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={goBack} className="text-slate-300 hover:text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button onClick={submit} disabled={submitting || !termsAccepted} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-11 px-6">
                      {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />} {submitting ? 'Submitting…' : 'Submit application'}
                    </Button>
                  </div>
                </div>
              )}

              {!singlePage && current && (
                <div>
                  <div className="flex items-start gap-3 mb-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 text-sm font-bold shrink-0">{step + 1}</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug">{current.text}{current.required && <span className="text-rose-400 ml-1">*</span>}</h2>
                      {current.description && <p className="mt-1.5 text-sm text-slate-400">{current.description}</p>}
                    </div>
                  </div>
                  <ApplyField q={current} value={answers[current.id]} autoFocus onChange={(v) => { setError(''); setAnswers({ ...answers, [current.id]: v }); }} />
                  {error && <div className="mt-3 flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" /> {error}</div>}
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={goBack} className="text-slate-300 hover:text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <div className="flex items-center gap-3">
                      {!current.required && isEmpty(answers[current.id]) && <button onClick={goNext} className="text-sm text-slate-500 hover:text-slate-300">Skip</button>}
                      <Button onClick={goNext} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-11 px-6">
                        {step === total - 1 ? 'Review' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-right text-[11px] text-slate-600">Press Enter ↵ to continue</div>
                </div>
              )}

              {step >= total && total > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardCheck className="h-6 w-6 text-cyan-300" />
                    <h2 className="text-2xl font-semibold text-white">Review your answers</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">{visibleQuestions.filter((q) => !isEmpty(answers[q.id])).length} of {visibleQuestions.length} answered · tap any answer to change it.</p>
                  <ApplyReview questions={visibleQuestions} answers={answers} onEdit={(i) => { setError(''); setStep(i); }} />
                  {error && <div className="mt-4 flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" /> {error}</div>}
                  <label className="mt-6 flex items-start gap-3 cursor-pointer rounded-xl bg-white/[0.03] border border-white/10 p-4">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 shrink-0" />
                    <span className="text-xs text-slate-400 leading-relaxed">I confirm my answers are my own original work. I have not used AI assistance, copied from others, or shared these questions unless explicitly permitted. Submitting false or plagiarized content may result in immediate rejection and a ban from future applications.</span>
                  </label>
                  <div className="mt-2 pl-1"><RespondingAs user={user} /></div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={goBack} className="text-slate-300 hover:text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button onClick={submit} disabled={submitting || !termsAccepted} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-11 px-6">
                      {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />} {submitting ? 'Submitting…' : 'Submit application'}
                    </Button>
                    <span className="ml-2 text-[11px] text-slate-600 hidden sm:inline">Ctrl+Enter ↵</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">This application was made inside of Dymatic Waves Studios.</p>
      </main>
    </div>
  );
}