import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UNLISTED_ID } from '@/lib/unlistedAppeal';
import { WEBSITE_BAN_TYPE, MAX_WEBSITE_APPEALS, countWebsiteAppeals, checkBanAppeal } from '@/lib/banAppealGuard';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const field = 'w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500';

export default function BanAppealForm({ user, reason, onCancel }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(null);
  const username = user?.data?.roblox_username || user?.roblox_username;
  const appealsLocked = user?.data?.appeals_locked || user?.appeals_locked;

  useEffect(() => { if (username) countWebsiteAppeals(username).then(setUsed); }, [username]);

  if (!username) return <p className="text-sm text-slate-400">Sign in with your verified Roblox account to report a mistake.</p>;
  if (appealsLocked) return <p className="text-sm text-rose-300">Your ability to submit appeals has been locked by staff. Contact an administrator if you believe this is a mistake.</p>;
  if (done) return <div className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Report sent — staff will review your ban.</div>;
  if (used === null) return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  if (used >= MAX_WEBSITE_APPEALS) return <p className="text-sm text-amber-300">You've used all {MAX_WEBSITE_APPEALS} ban reports. Staff will review what you've already sent.</p>;

  const submit = async () => {
    setBusy(true);
    setError('');
    const problem = await checkBanAppeal(text);
    if (problem) { setError(problem); setBusy(false); return; }
    await base44.entities.Appeal.create({
      moderation_id: UNLISTED_ID, roblox_username: username, unlisted_type: WEBSITE_BAN_TYPE,
      unlisted_reason: reason, appeal_reason: text.trim(), status: 'Pending',
    });
    setBusy(false);
    setDone(true);
  };

  return (
    <div className="space-y-3">
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={field}
        placeholder="In your own words, explain why you think this ban is a mistake..." />
      {error && <p className="flex items-center gap-2 text-xs text-rose-300"><AlertTriangle className="h-3.5 w-3.5" />{error}</p>}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{MAX_WEBSITE_APPEALS - used} of {MAX_WEBSITE_APPEALS} reports left</span>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
          <button onClick={submit} disabled={busy || text.trim().length < 10}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? 'Checking...' : 'Send report'}
          </button>
        </div>
      </div>
    </div>
  );
}