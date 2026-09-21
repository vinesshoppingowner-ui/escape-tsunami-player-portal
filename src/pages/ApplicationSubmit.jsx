import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteNav from '@/components/SiteNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, Send, CheckCircle2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ApplicationSubmit() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [app, setApp] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState({});
  const [answers, setAnswers] = useState({});
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

  const setAnswer = (qId, value) => setAnswers({ ...answers, [qId]: value });

  const validate = () => {
    for (const q of questions) {
      if (q.required) {
        const a = answers[q.id];
        if (a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0)) {
          toast({ title: `Question "${q.text}" is required`, variant: 'destructive' });
          return false;
        }
      }
      if (q.type === 'email' && answers[q.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers[q.id])) {
          toast({ title: `Invalid email for "${q.text}"`, variant: 'destructive' });
          return false;
        }
      }
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
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

  const renderField = (q) => {
    const value = answers[q.id];
    switch (q.type) {
      case 'textarea':
        return <Textarea value={value || ''} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || 'Enter your answer...'} maxLength={q.maxLength || undefined} className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]" />;
      case 'number':
        return <Input type="number" value={value || ''} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || 'Enter a number...'} className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />;
      case 'email':
        return <Input type="email" value={value || ''} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || 'Enter email...'} className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />;
      case 'date':
        return <Input type="date" value={value || ''} onChange={(e) => setAnswer(q.id, e.target.value)} className="bg-white/5 border-white/10 text-white" />;
      case 'dropdown':
        return (
          <select value={value || ''} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm">
            <option value="">Select an option...</option>
            {(q.options || []).map((opt, i) => <option key={i} value={opt} className="bg-slate-900">{opt}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {(q.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-2.5 cursor-pointer rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2.5 hover:bg-white/[0.06]">
                <input type="radio" name={q.id} checked={value === opt} onChange={() => setAnswer(q.id, opt)} className="accent-cyan-500" />
                <span className="text-sm text-slate-200">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(q.options || []).map((opt, i) => {
              const arr = Array.isArray(value) ? value : [];
              return (
                <label key={i} className="flex items-center gap-2.5 cursor-pointer rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2.5 hover:bg-white/[0.06]">
                  <input type="checkbox" checked={arr.includes(opt)} onChange={(e) => {
                    const next = e.target.checked ? [...arr, opt] : arr.filter((o) => o !== opt);
                    setAnswer(q.id, next);
                  }} className="accent-cyan-500" />
                  <span className="text-sm text-slate-200">{opt}</span>
                </label>
              );
            })}
          </div>
        );
      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setAnswer(q.id, n)} className="p-1">
                <Star className={`h-7 w-7 transition-colors ${(value || 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'}`} />
              </button>
            ))}
          </div>
        );
      case 'yesno':
        return (
          <div className="flex gap-2">
            <button onClick={() => setAnswer(q.id, true)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${value === true ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>Yes</button>
            <button onClick={() => setAnswer(q.id, false)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${value === false ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>No</button>
          </div>
        );
      default:
        return <Input value={value || ''} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || 'Enter your answer...'} maxLength={q.maxLength || undefined} className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <div className="flex items-center justify-center pt-28 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mr-2" /> Loading...
        </div>
      </div>
    );
  }

  if (!app || app.status !== 'open') {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-2xl mx-auto px-5 pt-28 pb-20 text-center">
          <p className="text-slate-400">{app ? 'This application is not currently accepting responses.' : 'Application not found.'}</p>
          <Link to="/applications" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">← Back to applications</Link>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-2xl mx-auto px-5 pt-28 pb-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Application Submitted!</h1>
          <p className="mt-2 text-slate-400">{app.success_message || 'Thank you for applying. We will review your application and get back to you.'}</p>
          <Link to="/applications">
            <Button className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">Back to Applications</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (existingResponse && settings.oneResponsePerUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-2xl mx-auto px-5 pt-28 pb-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Already Applied</h1>
          <p className="mt-2 text-slate-400">You have already submitted a response to this application. Status: <span className="text-cyan-300 capitalize">{existingResponse.status.replace('_', ' ')}</span></p>
          <Link to="/applications">
            <Button className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">Back to Applications</Button>
          </Link>
        </main>
      </div>
    );
  }

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0);
  }).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to applications
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{app.icon}</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{app.title}</h1>
        </div>
        {app.description && <p className="text-slate-400 mb-6">{app.description}</p>}

        {settings.showProgressBar && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress</span>
              <span>{answeredCount}/{questions.length}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-5">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-semibold shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1">
                  <Label className="text-sm font-medium text-white">{q.text}{q.required && <span className="text-rose-400 ml-1">*</span>}</Label>
                  {q.description && <p className="text-xs text-slate-500 mt-0.5">{q.description}</p>}
                </div>
              </div>
              <div className="ml-7">{renderField(q)}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={submit} disabled={submitting} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            <Send className="h-4 w-4 mr-1.5" /> {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </main>
    </div>
  );
}