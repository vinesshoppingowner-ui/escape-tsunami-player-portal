import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminVerifyButton({ onVerified }) {
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const input = 'w-full h-11 rounded-md bg-slate-950/60 border border-white/15 px-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500';
  const btn = 'h-11 px-5 rounded-md border border-amber-500/30 bg-amber-500/10 text-sm font-semibold text-amber-200 hover:bg-amber-500/20 disabled:opacity-50 inline-flex items-center justify-center gap-2';

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setDone(false);
    try {
      const res = await base44.functions.invoke('adminVerifyRoblox', { username });
      if (res.data?.error) { setError(res.data.error); return; }
      setDone(true);
      if (onVerified) onVerified(res.data.username);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="h-4 w-4 text-amber-400" />
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Admin quick-verify</p>
      </div>
      {!done ? (
        <form onSubmit={verify} className="flex flex-col sm:flex-row gap-2">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Roblox username to verify" className={input} />
          <button disabled={busy || !username.trim()} className={btn}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verify now
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 text-sm text-emerald-300">
          <ShieldCheck className="h-4 w-4" /> Verified as {username}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
  );
}