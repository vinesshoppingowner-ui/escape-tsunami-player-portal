import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { RESPONSE_STATUS, FEEDBACK_TEMPLATES } from '@/lib/applicationTypes';
import ResponseRatingTags from './ResponseRatingTags';

const fieldCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[70px] text-sm';

export default function ResponseDecisionPanel({ response, application, onUpdate }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState(response.status);
  const [notes, setNotes] = useState(response.staff_notes || '');
  const [feedback, setFeedback] = useState(response.applicant_feedback || '');
  const [retake, setRetake] = useState(!!response.retake_allowed);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(response.staff_rating || 0);
  const [tags, setTags] = useState(response.tags || []);

  useEffect(() => {
    setRating(response.staff_rating || 0); setTags(response.tags || []);
    setStatus(response.status); setNotes(response.staff_notes || '');
    setFeedback(response.applicant_feedback || ''); setRetake(!!response.retake_allowed);
  }, [response.id]);

  const save = async () => {
    setSaving(true);
    const updated = await base44.entities.ApplicationResponse.update(response.id, {
      status, staff_notes: notes, applicant_feedback: feedback, retake_allowed: retake, staff_rating: rating, tags,
      reviewed_by: user?.email, reviewed_at: new Date().toISOString(),
    });
    const decided = status !== response.status && (status === 'accepted' || status === 'rejected');
    if ((decided || (retake && !response.retake_allowed)) && response.roblox_username) {
      await base44.entities.Notification.create({
        roblox_username: response.roblox_username,
        title: decided ? `Application ${status}` : 'You can retake an application',
        body: feedback || (decided ? `Your application for "${application.title}" was ${status}.` : `Staff allowed you to retake "${application.title}".`),
        type: 'staff_message', read: false,
      });
    }
    setSaving(false);
    toast({ title: 'Response saved' });
    onUpdate(updated);
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(RESPONSE_STATUS).map(([k, s]) => (
          <button key={k} onClick={() => setStatus(k)} className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${status === k ? s.cls : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}>{s.label}</button>
        ))}
      </div>
      <ResponseRatingTags rating={rating} setRating={setRating} tags={tags} setTags={setTags} />
      <div className="flex flex-wrap gap-1">
        {FEEDBACK_TEMPLATES.map((t) => (
          <button key={t.label} type="button" onClick={() => { setStatus(t.status); setFeedback(t.text); }} className="px-2 py-1 rounded-md text-[11px] bg-white/5 border border-white/10 text-slate-300 hover:border-slate-600">⚡ {t.label}</button>
        ))}
      </div>
      <div>
        <div className="text-[11px] text-slate-400 mb-1">Feedback to applicant (they can see this)</div>
        <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="e.g. Great answers — welcome aboard! / Try giving more detail next time." className={fieldCls} />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 mb-1">Private staff notes</div>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only staff see this…" className={fieldCls} />
      </div>
      <button onClick={() => setRetake(!retake)} className={`w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium ${retake ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
        <RotateCcw className="h-3.5 w-3.5" /> {retake ? 'Retake granted' : 'Grant a retake'}
      </button>
      <button onClick={save} disabled={saving} className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? 'Saving…' : 'Save decision'}
      </button>
      {response.reviewed_by && <p className="text-[10px] text-slate-600 text-center">Last reviewed by {response.reviewed_by} · {new Date(response.reviewed_at).toLocaleString()}</p>}
    </div>
  );
}