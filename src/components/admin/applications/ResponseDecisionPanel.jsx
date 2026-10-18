import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, RotateCcw, Copy, Check, ShieldBan, Trash2, FastForward } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { RESPONSE_STATUS, FEEDBACK_TEMPLATES } from '@/lib/applicationTypes';
import ResponseRatingTags from './ResponseRatingTags';

const fieldCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[70px] text-sm';

export default function ResponseDecisionPanel({ response, application, onUpdate, onDelete, onNextUnreviewed }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState(response.status);
  const [notes, setNotes] = useState(response.staff_notes || '');
  const [feedback, setFeedback] = useState(response.applicant_feedback || '');
  const [retake, setRetake] = useState(!!response.retake_allowed);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(response.staff_rating || 0);
  const [tags, setTags] = useState(response.tags || []);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [blacklisting, setBlacklisting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setRating(response.staff_rating || 0);
    setTags(response.tags || []);
    setStatus(response.status);
    setNotes(response.staff_notes || '');
    setFeedback(response.applicant_feedback || '');
    setRetake(!!response.retake_allowed);
  }, [response.id, response.status, response.staff_rating, response.tags]);

  const save = async (overrideStatus) => {
    const nextStatus = typeof overrideStatus === 'string' ? overrideStatus : status;
    setSaving(true);
    try {
      const updated = await base44.entities.ApplicationResponse.update(response.id, {
        status: nextStatus,
        staff_notes: notes,
        applicant_feedback: feedback,
        retake_allowed: retake,
        staff_rating: rating,
        tags,
        reviewed_by: user?.email,
        reviewed_at: new Date().toISOString(),
      });
      const decided = nextStatus !== response.status && (nextStatus === 'accepted' || nextStatus === 'rejected');
      if ((decided || (retake && !response.retake_allowed)) && response.roblox_username) {
        await base44.entities.Notification.create({
          roblox_username: response.roblox_username,
          title: decided ? `Application ${nextStatus}` : 'You can retake an application',
          body: feedback || (decided ? `Your application for "${application.title}" was ${nextStatus}.` : `Staff allowed you to retake "${application.title}".`),
          type: 'staff_message',
          read: false,
        });
      }
      toast({ title: `Decision saved (${RESPONSE_STATUS[nextStatus]?.label || nextStatus})` });
      onUpdate(updated);
      if (autoAdvance && onNextUnreviewed) onNextUnreviewed(updated.id);
    } finally {
      setSaving(false);
    }
  };

  const copySummary = () => {
    const lines = [
      `**Application Review — ${application.title}**`,
      `Applicant: ${response.roblox_username || 'Unknown'} (${response.submitted_by_email || 'no email'})`,
      `Status: ${RESPONSE_STATUS[status]?.label || status}`,
      rating ? `Staff Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)` : null,
      response.ai_score !== undefined && response.ai_score !== null ? `AI Score: ${response.ai_score}/100` : null,
      tags.length ? `Tags: ${tags.join(', ')}` : null,
      feedback ? `Feedback: ${feedback}` : null,
      notes ? `Staff Notes: ${notes}` : null,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1800);
    toast({ title: 'Review summary copied to clipboard' });
  };

  const handleQuickBlacklist = async () => {
    const target = (response.roblox_username || response.submitted_by_email || '').trim().toLowerCase();
    if (!target) return;
    if (!confirm(`Blacklist "${target}" from submitting future applications?`)) return;
    setBlacklisting(true);
    try {
      await base44.entities.ApplicationBlacklist.create({
        identifier: target,
        roblox_username: (response.roblox_username || '').toLowerCase(),
        reason: notes || `Blacklisted during review of "${application.title}"`,
        banned_by: user?.email || '',
      });
      toast({ title: `${target} added to application blacklist` });
    } catch {
      toast({ title: 'Failed to blacklist applicant', variant: 'destructive' });
    } finally {
      setBlacklisting(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!confirm('Permanently delete this application response?')) return;
    setDeleting(true);
    try {
      await base44.entities.ApplicationResponse.delete(response.id);
      toast({ title: 'Submission deleted' });
      onDelete?.(response.id);
    } catch {
      toast({ title: 'Failed to delete submission', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Decision & Review</span>
        <span className="text-[10px] text-slate-500">Keys: A / R / U / S</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(RESPONSE_STATUS).map(([k, s]) => (
          <button
            key={k}
            onClick={() => setStatus(k)}
            className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
              status === k ? s.cls : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ResponseRatingTags rating={rating} setRating={setRating} tags={tags} setTags={setTags} />

      <div className="flex flex-wrap gap-1">
        {FEEDBACK_TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => { setStatus(t.status); setFeedback(t.text); }}
            className="px-2 py-1 rounded-md text-[11px] bg-white/5 border border-white/10 text-slate-300 hover:border-slate-600"
          >
            ⚡ {t.label}
          </button>
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

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setRetake(!retake)}
          className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium ${
            retake ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {retake ? 'Retake granted' : 'Grant retake'}
        </button>

        <button
          type="button"
          onClick={() => setAutoAdvance((a) => !a)}
          title="Jump to the next unreviewed submission after saving"
          className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium ${
            autoAdvance ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <FastForward className="h-3.5 w-3.5" /> Auto-next
        </button>
      </div>

      <button
        onClick={() => save()}
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Saving…' : 'Save decision'}
      </button>

      {/* Admin quick tools */}
      <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={copySummary}
          className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white"
        >
          {copiedSummary ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copiedSummary ? 'Copied' : 'Copy summary'}
        </button>
        <button
          type="button"
          onClick={handleQuickBlacklist}
          disabled={blacklisting}
          title="Blacklist applicant from future applications"
          className="inline-flex items-center justify-center gap-1 px-2.5 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-[11px] text-rose-300"
        >
          {blacklisting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldBan className="h-3 w-3" />}
          Blacklist
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteResponse}
            disabled={deleting}
            title="Delete this submission"
            className="inline-flex items-center justify-center p-2 h-8 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        )}
      </div>

      {response.reviewed_by && (
        <p className="text-[10px] text-slate-600 text-center">
          Last reviewed by {response.reviewed_by} · {new Date(response.reviewed_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}