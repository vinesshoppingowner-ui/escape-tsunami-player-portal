import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Copy, Check } from 'lucide-react';

export default function BioCodeVerify() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const call = async (payload) => {
    setBusy(true);
    setError('');
    const res = await base44.functions.invoke('robloxBioVerify', payload).catch((e) => ({ data: { error: e.response?.data?.error || e.message } }));
    setBusy(false);
    if (res.data?.error) { setError(res.data.error); return null; }
    return res.data;
  };

  const start = async (e) => {
    e.preventDefault();
    const d = await call({ action: 'start', username });
    if (d) setCode(d.code);
  };
  const check = async () => { if (await call({ action: 'check' })) window.location.reload(); };
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const input = 'w-full h-11 rounded-md bg-slate-950/60 border border-white/15 px-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500';
  const btn = 'h-11 px-5 rounded-md border border-white/15 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50 inline-flex items-center justify-center gap-2';

  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Or verify with a bio code</p>
      {!code ? (
        <form onSubmit={start} className="flex flex-col sm:flex-row gap-2">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Roblox username" className={input} />
          <button disabled={busy || !username.trim()} className={btn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Get code</button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Paste this code anywhere in your Roblox profile "About" section, save it, then press Verify.</p>
          <button type="button" onClick={copy} className="w-full flex items-center justify-between gap-2 rounded-md bg-slate-950/60 border border-cyan-500/30 px-3 py-2.5 font-mono text-sm text-cyan-200 break-all text-left">
            {code} {copied ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
          </button>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={check} disabled={busy} className={btn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify</button>
            <button type="button" onClick={() => setCode('')} className="h-11 px-4 text-sm text-slate-400 hover:text-white">Use a different username</button>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
  );
}