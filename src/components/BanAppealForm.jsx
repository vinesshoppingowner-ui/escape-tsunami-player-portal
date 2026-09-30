import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UNLISTED_ID } from '@/lib/unlistedAppeal';
import { Loader2, CheckCircle2 } from 'lucide-react';

const field = 'w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';

export default function BanAppealForm({ user, reason, onCancel }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const username = user?.data?.roblox_username || user?.roblox_username;

  if (!username) {
    return <p className="text-sm text-slate-400">Sign in with your verified Roblox account to report a mistake.</p>;
  }
  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-300">
        <CheckCircle2 className="h-4 w-4" /> Report sent — staff will review your ban.
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    await base44.entities.Appeal.create({
      moderation_id: UNLISTED_ID,
      roblox_username: username,
      unlisted_type: 'Website Ban',
      unlisted_reason: reason,
      appeal_reason: text.trim(),
      status: 'Pending',
    });
    setBusy(false);
    setDone(true);
  };

  return (
    <div className="space-y-3">
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={field}
        placeholder="Explain why you think this ban is a mistake..." />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
        <button onClick={submit} disabled={busy || text.trim().length < 10}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send report
        </button>
      </div>
    </div>
  );
}