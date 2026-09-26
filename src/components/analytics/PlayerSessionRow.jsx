import { Crown } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

export const formatDuration = (sec) => {
  const s = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

export default function PlayerSessionRow({ session, now }) {
  const secs = session.online
    ? (now - new Date(session.joined_at).getTime()) / 1000
    : session.duration_seconds;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
      <RobloxAvatar username={session.roblox_username} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-white truncate">
          {session.roblox_username}
          {session.is_premium && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20">
              <Crown className="h-3 w-3" /> Premium
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 truncate">{session.server_name || 'Unknown server'}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-slate-200 tabular-nums">{formatDuration(secs)}</div>
        <div className={`text-[11px] ${session.online ? 'text-emerald-400' : 'text-slate-500'}`}>
          {session.online ? '● Playing now' : 'Left'}
        </div>
      </div>
    </div>
  );
}