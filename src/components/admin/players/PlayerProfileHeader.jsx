import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, Globe, ShieldAlert } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

export default function PlayerProfileHeader({ username }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.WatchlistEntry.filter({ roblox_username: username }),
      base44.entities.Moderation.filter({ roblox_username: username, status: 'Active' }),
      base44.entities.User.list().catch(() => []),
    ]).then(([watch, active, users]) => setInfo({
      watch: watch?.[0],
      active: active || [],
      account: (users || []).find((u) => u.roblox_username?.toLowerCase() === username.toLowerCase()),
    }));
  }, [username]);

  const banned = info?.active.some((m) => m.moderation_type.includes('Ban'));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <RobloxAvatar username={username} size={72} />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold truncate">{username}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {banned ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-200"><ShieldAlert className="h-3 w-3" /> Currently banned</span>
          ) : info && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">{info.active.length ? `${info.active.length} active punishment(s)` : 'Good standing'}</span>
          )}
          {info?.watch && <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200"><Eye className="h-3 w-3" /> Watchlist · {info.watch.level}</span>}
          {info && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
              <Globe className="h-3 w-3" /> {info.account ? `Portal: ${info.account.email}${info.account.last_seen ? ` · seen ${new Date(info.account.last_seen).toLocaleDateString()}` : ''}` : 'No portal account'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}