import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, ScanSearch, ArrowRight, Eye, Check, RefreshCw } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { detectEvasion } from '@/lib/evasionDetect';

const SCORE_STYLES = ['', 'text-slate-300 border-white/15', 'text-amber-300 border-amber-500/30', 'text-rose-300 border-rose-500/30'];

export default function BanEvasionTab() {
  const { user } = useAuth();
  const [flags, setFlags] = useState(null);
  const [watched, setWatched] = useState(new Set());

  const scan = async () => {
    setFlags(null);
    const [moderations, users, streaks, watch] = await Promise.all([
      base44.entities.Moderation.list('-moderation_date', 1000),
      base44.entities.User.list(),
      base44.entities.UserStreak.list('-created_date', 1000),
      base44.entities.WatchlistEntry.list('-created_date', 500),
    ]);
    setWatched(new Set((watch || []).map((w) => w.roblox_username.toLowerCase())));
    setFlags(detectEvasion({ moderations: moderations || [], users: users || [], streaks: streaks || [] }));
  };
  useEffect(() => { scan(); }, []);

  const watch = async (f) => {
    await base44.entities.WatchlistEntry.create({
      roblox_username: f.suspect, level: f.score >= 3 ? 'high' : 'medium',
      reason: `Possible alt of banned player ${f.banned} (${f.reasons.map((r) => r.text).join(', ')})`,
      added_by: user?.full_name || user?.email,
    });
    setWatched((s) => new Set(s).add(f.suspect.toLowerCase()));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <ScanSearch className="h-5 w-5 text-rose-400" />
        <h2 className="text-lg font-semibold text-white">Ban evasion detector</h2>
        {flags && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">{flags.length} flagged</span>}
        <button onClick={scan} className="ml-auto text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-slate-300 hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5" /> Rescan</button>
      </div>
      <p className="text-xs text-slate-500">Compares actively banned players with every other known account — matching Discord accounts, same names with different numbers, and near-identical usernames.</p>
      {flags === null ? (
        <div className="flex justify-center py-12 text-slate-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Scanning…</div>
      ) : flags.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-12 text-center text-sm text-slate-400">No suspected alt accounts found.</div>
      ) : (
        <div className="space-y-2">
          {flags.map((f) => {
            const isWatched = watched.has(f.suspect.toLowerCase());
            return (
              <div key={`${f.banned}-${f.suspect}`} className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2"><RobloxAvatar username={f.banned} size={32} /><span className="text-rose-300 font-medium">{f.banned}</span></div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <div className="flex items-center gap-2"><RobloxAvatar username={f.suspect} size={32} /><span className="text-cyan-300 font-medium">{f.suspect}</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {f.reasons.map((r) => <span key={r.text} className={`text-[10px] px-2 py-0.5 rounded-full border bg-white/[0.03] ${SCORE_STYLES[Math.min(r.weight, 3)]}`}>{r.text}</span>)}
                </div>
                <button onClick={() => watch(f)} disabled={isWatched} className="ml-auto text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 disabled:opacity-50">
                  {isWatched ? <><Check className="h-3.5 w-3.5" /> Watching</> : <><Eye className="h-3.5 w-3.5" /> Add to watchlist</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}