import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ExternalLink } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

export default function PlayerPreviewPanel({ username }) {
  const [state, setState] = useState(null); // null | 'loading' | 'notfound' | { profile, mods }

  useEffect(() => {
    const name = username.trim();
    if (name.length < 3) { setState(null); return; }
    setState('loading');
    let active = true;
    const t = setTimeout(async () => {
      const res = await fetch('https://users.roproxy.com/v1/usernames/users', {
        method: 'POST', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ usernames: [name], excludeBannedUsers: false }),
      }).then((r) => r.json()).catch(() => null);
      const match = res?.data?.[0];
      if (!active) return;
      if (!match) { setState('notfound'); return; }
      const [profile, mods] = await Promise.all([
        fetch(`https://users.roproxy.com/v1/users/${match.id}`).then((r) => r.json()).catch(() => match),
        base44.entities.Moderation.filter({ roblox_username: match.name }, '-moderation_date', 50),
      ]);
      if (active) setState({ profile: { ...match, ...profile }, mods });
    }, 500);
    return () => { active = false; clearTimeout(t); };
  }, [username]);

  if (!state) return null;
  if (state === 'loading') return <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Looking up player…</div>;
  if (state === 'notfound') return <div className="text-xs text-rose-300">No Roblox account found with that username.</div>;

  const { profile: p, mods } = state;
  return (
    <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3 space-y-3">
      <div className="flex items-center gap-3">
        <RobloxAvatar username={p.name} size={44} />
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">{p.displayName} <span className="text-slate-500">@{p.name}</span></div>
          <div className="text-xs text-slate-400">ID {p.id}{p.created && ` · Joined ${new Date(p.created).toLocaleDateString()}`}{p.isBanned && ' · Banned on Roblox'}</div>
        </div>
        <a href={`https://www.roblox.com/users/${p.id}/profile`} target="_blank" rel="noreferrer" className="ml-auto text-slate-400 hover:text-white"><ExternalLink className="h-4 w-4" /></a>
      </div>
      <div className="border-t border-white/5 pt-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">Moderation history ({mods.length})</div>
        {mods.length === 0 ? <div className="text-xs text-slate-400">Clean record — no moderations.</div> : (
          <div className="max-h-40 overflow-y-auto divide-y divide-white/5">
            {mods.map((m) => (
              <div key={m.id} className="flex items-center gap-2 py-1.5 text-xs">
                <span className="font-medium text-slate-200 w-28 shrink-0">{m.moderation_type}</span>
                <span className="text-slate-400 truncate flex-1">{m.reason}</span>
                <span className="text-slate-500 shrink-0">{m.status}</span>
                <span className="text-slate-500 shrink-0 w-20 text-right">{m.moderation_date ? new Date(m.moderation_date).toLocaleDateString() : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}