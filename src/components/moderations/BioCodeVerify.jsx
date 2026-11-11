import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Copy, Check, RefreshCw } from 'lucide-react';

export default function BioCodeVerify({ onVerified }) {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingPending, setLoadingPending] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const call = async (payload) => {
    setBusy(true);
    setError('');
    const res = await base44.functions
      .invoke('robloxBioVerify', payload)
      .catch((e) => ({ data: { error: e.response?.data?.error || e.message } }));
    setBusy(false);
    if (res?.data?.error) {
      setError(res.data.error);
      return null;
    }
    return res?.data;
  };

  useEffect(() => {
    let active = true;
    base44.functions
      .invoke('robloxBioVerify', { action: 'status' })
      .then((res) => {
        if (!active) return;
        const pending = res?.data?.pending;
        if (pending?.code) {
          setUsername(pending.username || '');
          setCode(pending.code);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingPending(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const start = async (e) => {
    e.preventDefault();
    const d = await call({ action: 'start', username: username.trim().replace(/^@/, '') });
    if (d) {
      setCode(d.code);
      if (d.username) setUsername(d.username);
    }
  };

  const regenerate = async () => {
    if (!username.trim()) return;
    const d = await call({ action: 'start', username: username.trim().replace(/^@/, ''), forceNew: true });
    if (d?.code) setCode(d.code);
  };

  const check = async () => {
    const d = await call({ action: 'check', username, code });
    if (d?.username) {
      if (onVerified) await onVerified(d.username);
      window.location.reload();
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const resetUsername = () => {
    setCode('');
    setError('');
  };

  const input =
    'w-full h-11 rounded-md bg-slate-950/60 border border-white/15 px-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500';
  const btn =
    'h-11 px-5 rounded-md border border-white/15 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50 inline-flex items-center justify-center gap-2';

  if (loadingPending) {
    return (
      <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking verification status...
      </div>
    );
  }

  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Or verify with a bio code</p>
      {!code ? (
        <form onSubmit={start} className="flex flex-col sm:flex-row gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Roblox username"
            className={input}
          />
          <button disabled={busy || !username.trim()} className={btn}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Get code
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Paste this code anywhere in <strong className="text-white">@{username}</strong>'s Roblox profile "About" section, save it, then press Verify.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copy}
              className="flex-1 flex items-center justify-between gap-2 rounded-md bg-slate-950/60 border border-cyan-500/30 px-3.5 py-2.5 font-mono text-base font-semibold tracking-wide text-cyan-200 text-left hover:bg-slate-900/80 transition-colors"
            >
              <span>{code}</span>
              <span className="inline-flex items-center gap-1 text-xs font-sans font-normal text-cyan-300/80">
                {copied ? <Check className="h-4 w-4 shrink-0 text-emerald-400" /> : <Copy className="h-4 w-4 shrink-0" />}
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
            <button
              type="button"
              onClick={regenerate}
              disabled={busy}
              title="Get a different short code"
              className="h-11 px-3 rounded-md border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50 inline-flex items-center justify-center"
            >
              <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={check} disabled={busy} className={btn}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify
            </button>
            <button type="button" onClick={resetUsername} className="h-11 px-4 text-sm text-slate-400 hover:text-white">
              Use a different username
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
  );
}