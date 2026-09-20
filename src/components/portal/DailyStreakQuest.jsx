import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy, Loader2, Check, Gift, CalendarCheck, MessageCircle, AlertCircle, Link2, ExternalLink } from 'lucide-react';

const STREAK_GOAL = 7;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(dateStr) {
  if (!dateStr) return Infinity;
  const last = new Date(dateStr + 'T00:00:00');
  const today = new Date(todayStr() + 'T00:00:00');
  return Math.floor((today - last) / 86400000);
}

export default function DailyStreakQuest({ robloxUsername }) {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [discordIdInput, setDiscordIdInput] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [roleStatus, setRoleStatus] = useState(null); // null | 'assigning' | 'assigned' | 'failed'

  const loadStreak = async () => {
    try {
      const records = await base44.entities.UserStreak.filter({ roblox_username: robloxUsername }, '-created_date', 1);
      if (records && records.length > 0) {
        setStreak(records[0]);
      } else {
        const created = await base44.entities.UserStreak.create({
          roblox_username: robloxUsername,
          current_streak: 0,
          tag_unlocked: false,
          total_days_claimed: 0,
        });
        setStreak(created);
      }
    } catch {
      setStreak(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (robloxUsername) loadStreak();
  }, [robloxUsername]);

  const linkDiscord = async () => {
    const trimmed = discordIdInput.trim();
    if (!trimmed) { setLinkError('Please enter your Discord user ID'); return; }
    if (!/^\d{17,20}$/.test(trimmed)) { setLinkError('Discord user ID should be a 17–20 digit number'); return; }
    setLinking(true);
    setLinkError('');
    try {
      const updated = await base44.entities.UserStreak.update(streak.id, { discord_id: trimmed });
      setStreak(updated);
      setDiscordIdInput('');
    } catch {
      setLinkError('Could not save your Discord ID. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 p-6 flex items-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading streak quest…
      </div>
    );
  }

  if (!streak) return null;

  // ── Gate 1: Discord must be linked ──
  if (!streak.discord_id) {
    return (
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-500/[0.06] to-violet-600/[0.06] border border-indigo-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">7-Day Devoted Quest</h3>
            <p className="text-xs text-slate-400 mt-0.5">Link your Discord to start earning the <span className="text-amber-300 font-medium">Devoted</span> role.</p>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium">How to find your Discord user ID:</span>
            <br />
            1. Open Discord → <span className="text-slate-300">Settings → Advanced → Developer Mode</span> and enable it
            <br />
            2. Right-click your username → <span className="text-slate-300">Copy User ID</span>
            <br />
            3. Paste it below
          </div>

          <input
            type="text"
            value={discordIdInput}
            onChange={(e) => setDiscordIdInput(e.target.value)}
            placeholder="e.g. 123456789012345678"
            className="w-full rounded-lg bg-slate-950/50 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
          />

          {linkError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {linkError}
            </div>
          )}

          <button
            onClick={linkDiscord}
            disabled={linking}
            className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Link Discord Account
          </button>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 flex items-start gap-1.5">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          You must be a member of the Escape Tsunami Discord server for the bot to assign you the role.
        </div>
      </div>
    );
  }

  // ── Gate 2: Discord linked — show the streak quest ──
  const lastClaim = streak.last_claimed_date;
  const gap = daysBetween(lastClaim);
  const alreadyClaimedToday = lastClaim === todayStr();
  const streakWillReset = !alreadyClaimedToday && gap > 1;
  const effectiveStreak = streakWillReset ? 0 : streak.current_streak;
  const canClaim = !alreadyClaimedToday;
  const tagUnlocked = streak.tag_unlocked;

  const claim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    setRoleStatus(null);
    try {
      const newStreak = streakWillReset ? 1 : streak.current_streak + 1;
      const reachedGoal = newStreak >= STREAK_GOAL;
      const updated = await base44.entities.UserStreak.update(streak.id, {
        current_streak: newStreak,
        last_claimed_date: todayStr(),
        tag_unlocked: reachedGoal || streak.tag_unlocked,
        total_days_claimed: (streak.total_days_claimed || 0) + 1,
      });
      setStreak(updated);

      // If they just hit day 7, ask the backend to assign the Discord role
      if (reachedGoal && !streak.tag_unlocked) {
        setRoleStatus('assigning');
        try {
          const res = await base44.functions.invoke('assign-devoted-role', {
            discord_id: streak.discord_id,
            roblox_username: robloxUsername,
          });
          if (res.data?.success) {
            setRoleStatus('assigned');
          } else {
            setRoleStatus('failed');
          }
        } catch {
          setRoleStatus('failed');
        }
      }
    } finally {
      setClaiming(false);
    }
  };

  const days = Array.from({ length: STREAK_GOAL }, (_, i) => i + 1);

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-amber-500/[0.06] to-orange-600/[0.06] border border-amber-500/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              7-Day Devoted Quest
              {tagUnlocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  <Trophy className="h-2.5 w-2.5" /> Unlocked
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Claim your streak daily for 7 days to earn the <span className="text-amber-300 font-medium">Devoted</span> Discord role.</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-amber-300">{effectiveStreak}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">day streak</div>
        </div>
      </div>

      {/* Discord linked indicator */}
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full">
        <MessageCircle className="h-3 w-3" /> Discord linked: {streak.discord_id}
      </div>

      {/* Day progress */}
      <div className="mt-4 flex items-center gap-1.5">
        {days.map((d) => {
          const claimed = d <= effectiveStreak;
          const isToday = d === effectiveStreak + 1 && canClaim;
          return (
            <div key={d} className="flex-1 flex flex-col items-center gap-1.5 transition-all">
              <div
                className={`h-9 w-full rounded-lg flex items-center justify-center text-xs font-semibold border transition-all ${
                  claimed
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : isToday
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 animate-pulse'
                    : 'bg-white/[0.02] border-white/10 text-slate-600'
                }`}
              >
                {claimed ? <Check className="h-4 w-4" /> : d}
              </div>
              <span className={`text-[9px] ${claimed ? 'text-amber-400' : 'text-slate-600'}`}>Day {d}</span>
            </div>
          );
        })}
      </div>

      {/* Role assignment status */}
      {roleStatus === 'assigning' && (
        <div className="mt-4 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 p-3 flex items-center gap-2 text-sm text-indigo-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Assigning your Devoted role in Discord…
        </div>
      )}
      {roleStatus === 'assigned' && (
        <div className="mt-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 p-3 flex items-center gap-2 text-sm text-emerald-300">
          <Trophy className="h-4 w-4" /> Devoted role assigned! Check your Discord server.
        </div>
      )}
      {roleStatus === 'failed' && (
        <div className="mt-4 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 p-3 flex items-start gap-2 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Couldn't assign the Discord role automatically. Make sure you're in the Escape Tsunami Discord server, then try again or contact staff.</span>
        </div>
      )}

      {/* Status / claim button */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {tagUnlocked ? (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <Gift className="h-4 w-4" /> You've earned the Devoted role!
          </div>
        ) : alreadyClaimedToday ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarCheck className="h-4 w-4 text-emerald-400" /> Claimed today — come back tomorrow.
          </div>
        ) : streakWillReset && streak.current_streak > 0 ? (
          <div className="flex items-center gap-2 text-sm text-rose-300">
            <Flame className="h-4 w-4" /> You missed a day — claiming now resets to Day 1.
          </div>
        ) : (
          <div className="text-sm text-slate-400">Claim today to keep your streak alive.</div>
        )}
        <button
          onClick={claim}
          disabled={!canClaim || claiming || tagUnlocked}
          className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all shrink-0 ${
            canClaim && !tagUnlocked
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20'
              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
          }`}
        >
          {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
          {alreadyClaimedToday ? 'Claimed' : 'Claim today'}
        </button>
      </div>

      {streak.total_days_claimed > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-500">
          Total days claimed: {streak.total_days_claimed}
        </div>
      )}
    </div>
  );
}