import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  { value: 'under_review', label: 'Under Review', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
];

export default function ResponseViewer({ open, response, application, onClose, onUpdate }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState('submitted');
  const [staffNotes, setStaffNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (response) {
      setStatus(response.status || 'submitted');
      setStaffNotes(response.staff_notes || '');
    }
  }, [response]);

  if (!open || !response) return null;

  const questions = JSON.parse(application?.questions || '[]');
  const answers = JSON.parse(response?.answers || '{}');

  const save = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.ApplicationResponse.update(response.id, {
        status,
        staff_notes: staffNotes,
        reviewed_by: user?.email,
        reviewed_at: new Date().toISOString(),
      });
      toast({ title: 'Response updated' });
      onUpdate(updated);
      onClose();
    } catch (e) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderAnswer = (q) => {
    const answer = answers[q.id];
    if (answer === undefined || answer === null || answer === '') return <span className="text-slate-600 italic">No answer</span>;
    if (q.type === 'checkbox' && Array.isArray(answer)) return answer.join(', ');
    if (q.type === 'rating') return '⭐'.repeat(Number(answer));
    if (q.type === 'yesno') return answer ? 'Yes' : 'No';
    return String(answer);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-5">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="font-semibold text-white">{response.roblox_username || 'Unknown'}</h3>
            <p className="text-xs text-slate-500">{response.submitted_by_email} · {new Date(response.created_date).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Responses</div>
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <div className="text-xs text-slate-400 mb-1">Q{i + 1}. {q.text}</div>
              <div className="text-sm text-white whitespace-pre-wrap">{renderAnswer(q)}</div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-white/10 space-y-3">
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Status</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button key={s.value} onClick={() => setStatus(s.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${status === s.value ? s.color : 'bg-white/5 text-slate-400 border-white/10'}`}>{s.label}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Staff Notes (private)</Label>
            <Textarea value={staffNotes} onChange={(e) => setStaffNotes(e.target.value)} placeholder="Internal notes about this applicant..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]" />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-300">Close</Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}