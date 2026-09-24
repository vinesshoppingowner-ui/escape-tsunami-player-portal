import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban', 'Other'];
const MIN = 20;
const field = 'bg-slate-900/60 border-white/15 text-white placeholder:text-slate-500';
const QUESTIONS = [
  ['appeal_reason', 'Explain what happened *'],
  ['why_accepted', 'Why should your appeal be accepted? *'],
  ['deserved_infraction', 'Did you deserve this punishment in your opinion? *'],
];
const EMPTY = { unlisted_type: 'Temporary Ban', unlisted_date: '', unlisted_reason: '', appeal_reason: '', why_accepted: '', deserved_infraction: '' };

export default function UnlistedAppealDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (open) setForm(EMPTY); }, [open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = QUESTIONS.every(([k]) => form[k].trim().length >= MIN) && !submitting;

  const submit = async () => {
    setSubmitting(true);
    await onSubmit(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)));
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-white/15 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-semibold">Appeal a punishment not shown</DialogTitle>
        <DialogDescription className="text-slate-400">Got punished but it isn't listed in your history? Tell staff what happened.</DialogDescription>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-sm">Punishment type
              <select value={form.unlisted_type} onChange={set('unlisted_type')} className={`w-full h-9 rounded-md border px-2 ${field}`}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm">When (approx.)
              <Input type="date" value={form.unlisted_date} onChange={set('unlisted_date')} className={field} />
            </label>
          </div>
          <label className="block space-y-1.5 text-sm">Reason you were given (optional)
            <Input value={form.unlisted_reason} onChange={set('unlisted_reason')} placeholder="e.g. Exploiting" className={field} />
          </label>
          {QUESTIONS.map(([k, label]) => (
            <label key={k} className="block space-y-1.5 text-sm">{label}
              <Textarea value={form[k]} onChange={set(k)} rows={3} maxLength={500} placeholder={`At least ${MIN} characters…`} className={`${field} resize-none`} />
            </label>
          ))}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={submit} disabled={!canSubmit} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : 'Submit appeal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}