import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteNav from '@/components/SiteNav';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Send, CheckCircle2, FileQuestion, Lock, ClipboardCheck, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ApplyField from '@/components/apply/ApplyField';
import ApplyReview from '@/components/apply/ApplyReview';
import ApplyStatusScreen from '@/components/apply/ApplyStatusScreen';

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
  const [existingResponse, setExistingResponse] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await base44.entities.Application.get(id);
        setApp(a);
        setQuestions(JSON.parse(a.questions || '[]'));
        setSettings(JSON.parse(a.settings || '{}'));
        const responses = await base44.entities.ApplicationResponse.filter({ application_id: id }, '-created_date', 1);
        if (responses?.length > 0) setExistingResponse(responses[0]);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const total = questions.length;
  const current = step >= 0 && step < total ? questions[step] : null;

  const validateQuestion = (q) => {
    const a = answers[q.id];
    if (q.required && isEmpty(a)) return 'This question is required.';
    if (q.type === 'email' && !isEmpty(a) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)) return 'Please enter a valid email address.';
    return '';
  };

  const goNext = () => {
    if (current) {
      const err = validateQuestion(current);
      if (err) { setError(err); return; }
    }
    setError('');
    setStep((s) => Math.min(s + 1, total));
  };
  const goBack = () => { setError(''); setStep((s) => Math.max(s - 1, -1)); };

  const submit = async () => {
    const firstBad = questions.findIndex((q) => validateQuestion(q));
    if (firstBad !== -1) { setStep(firstBad); setError(validateQuestion(questions[firstBad])); return; }
    setSubmitting(true);
    try {
      await base44.entities.ApplicationResponse.create({
        application_id: id,
        application_title: app.title,
        roblox_username: user?.roblox_username || user?.data?.roblox_username || '',
        submitted_by_email: user?.email || '',
        answers: JSON.stringify(answers),
        status: 'submitted',
      });
      await base44.entities.Application.update(id, { response_count: (app.response_count || 0) + 1 });
      setSubmitted(true);
    } catch (e) {
      toast({ title: 'Failed to submit', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter' || e.shiftKey || e.target.tagName === 'TEXTAREA') return;
      if (step >= 0 && step < total) { e.preventDefault(); goNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <div className="flex items-center justify-center pt-32 text-slate-400"><Loader2 className="h-6 w-6 animate-spin text-cyan-400 mr-2" /> Loading application…</div>
      </div>
    );
  }
  if (!app) return <ApplyStatusScreen icon={FileQuestion} tone="slate" title="Application not found">This link may be broken or the application was removed.</ApplyStatusScreen>;
  if (app.status !== 'open') return <ApplyStatusScreen icon={Lock} tone="rose" title="Applications closed">"{app.title}" is not currently accepting responses.</ApplyStatusScreen>;
  if (submitted) return <ApplyStatusScreen icon={CheckCircle2} tone="emerald" title="Application submitted!">{app.success_message || 'Thank you for applying. Our team will review your application and get back to you.'}</ApplyStatusScreen>;
  if (existingResponse && settings.oneResponsePerUser) {
    return (
      <ApplyStatusScreen icon={Clock} tone="cyan" title="You've already applied">
        Your response to "{app.title}" is <span className="text-cyan-300 capitalize">{existingResponse.status.replace('_', ' ')}</span>. Check the Applications page for status updates.
      </ApplyStatusScreen>
    );
  }

  const answered = questions.filter((q) => !isEmpty(answers[q.id])).length;
  const progress = step < 0 ? 0 : step >= total ? 100 : (step / total) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-2xl mx-auto px-5 pt-28 pb-24">
        <div className="flex items-center justify-between mb-4">
          <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /> All applications</Link>
          <div className="text-xs text-slate-500">{step < 0 ? `${total} question${total !== 1 ? 's' : ''}` : step >= total ? 'Review' : `Question ${step + 1} of ${total}`}</div>
        </div>

        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-8">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              {step < 0 && (
                <div className="text-center">
                  <div className="text-6xl mb-4">{app.icon}</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">{app.category || 'Application'}</div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{app.title}</h1>
                  {app.description && <p className="mt-4 text-slate-400 leading-relaxed">{app.description}</p>}
                  <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">{total} questions</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">~{Math.max(1, Math.ceil(total * 0.75))} min</span>
                    {user && <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Applying as {user.roblox_username || user.email}</span>}
                  </div>
                  <Button onClick={goNext} size="lg" className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-12 px-8">Start application <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              )}

              {current && (
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
                  <p className="text-sm text-slate-400 mb-6">{answered} of {total} answered · tap any answer to change it.</p>
                  <ApplyReview questions={questions} answers={answers} onEdit={(i) => { setError(''); setStep(i); }} />
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={goBack} className="text-slate-300 hover:text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button onClick={submit} disabled={submitting} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-11 px-6">
                      {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />} {submitting ? 'Submitting…' : 'Submit application'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}