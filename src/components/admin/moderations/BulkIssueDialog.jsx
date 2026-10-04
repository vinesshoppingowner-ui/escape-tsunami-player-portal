import { useState } from 'react';
import { Loader2, Gavel } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const field = 'bg-slate-950/50 border-slate-800 text-white focus-visible:ring-cyan-500';

export default function BulkIssueDialog({ usernames, onClose, onSubmit }) {
  const [form, setForm] = useState({ moderation_type: 'Warning', reason: '', duration: '' });
  const [busy, setBusy] = useState(false);
  const needsDuration = form.moderation_type === 'Temporary Ban' || form.moderation_type === 'Mute';

  const submit = async () => {
    setBusy(true);
    await onSubmit({ ...form, duration: form.moderation_type === 'Permanent Ban' ? 'Permanent' : form.duration });
    setBusy(false);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader><DialogTitle>Issue action to {usernames.length} player(s)</DialogTitle></DialogHeader>
        <p className="text-xs text-slate-400 break-words">{usernames.join(', ')}</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setForm({ ...form, moderation_type: t })}
              className={`text-xs px-3 py-1.5 rounded-md border ${form.moderation_type === t ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300'}`}>{t}</button>
          ))}
        </div>
        <Textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={field} />
        {needsDuration && <Input placeholder="Duration, e.g. 7d" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={field} />}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="h-9 px-4 rounded-md border border-slate-700 text-sm text-slate-300">Cancel</button>
          <button onClick={submit} disabled={busy || !form.reason.trim() || (needsDuration && !form.duration.trim())}
            className="h-9 px-4 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-sm inline-flex items-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />} Issue to all
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}