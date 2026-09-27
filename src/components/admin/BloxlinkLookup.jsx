import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Link2, AlertTriangle } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

export default function BloxlinkLookup() {
  const [mode, setMode] = useState('roblox');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      setResult((await base44.functions.invoke('bloxlinkLookup', { mode, query })).data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-0.5 rounded-lg bg-slate-900/60 border border-white/10 w-fit">
        {[['roblox', 'By Roblox username'], ['discord', 'By Discord ID']].map(([v, l]) => (
          <button key={v} onClick={() => { setMode(v); setResult(null); setError(null); }} className={`px-3 py-1 rounded-md text-xs ${mode === v ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder={mode === 'roblox' ? 'Enter Roblox username…' : 'Enter Discord user ID…'} className="bg-slate-950/60 border-white/15 text-white" />
        <Button onClick={search} disabled={loading || !query.trim()} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Lookup
        </Button>
      </div>
      {error && <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300 flex gap-2"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{error}</div>}
      {result && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="flex items-center gap-3">
            <RobloxAvatar username={result.roblox.username} size={56} />
            <div>
              <div className="text-xs uppercase text-slate-500">Roblox</div>
              <div className="font-semibold text-white">{result.roblox.displayName}</div>
              <div className="text-sm text-slate-400">@{result.roblox.username} · {result.roblox.id}</div>
            </div>
          </div>
          <Link2 className="h-5 w-5 text-cyan-400 mx-auto" />
          <div className="space-y-2">
            {result.discord.map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                {d.avatar && <img src={d.avatar} alt="" className="h-14 w-14 rounded-full" />}
                <div>
                  <div className="text-xs uppercase text-slate-500">Discord</div>
                  {d.inServer ? <>
                    <div className="font-semibold text-white">{d.displayName}</div>
                    <div className="text-sm text-slate-400">@{d.username} · {d.id}</div>
                  </> : <div className="text-sm text-slate-400">{d.id} (no longer in server)</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && !error && !loading && <p className="text-sm text-slate-500 text-center py-10">Finds linked Roblox ↔ Discord accounts for members verified with Bloxlink in your server.</p>}
    </div>
  );
}