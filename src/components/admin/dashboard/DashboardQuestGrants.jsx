import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Gift, Flame, Trophy, Plus } from 'lucide-react';

const STREAK_GOAL = 7;

export default function DashboardQuestGrants() {
  const [search, setSearch] = useState('');
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [daysToGrant, setDaysToGrant] = useState(1);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const searchStreak = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setMessage(null);
    setStreak(null);
    try {
      const records = await base44.entities.UserStreak.filter(
        { roblox_username: search.trim() },
        '-created_date',
        1
      );
      if (records && records.length > 0) {
        setStreak(records[0]);
      } else {
        setMessage('No streak record found for this user. They need to visit the portal quest at least once first.');
        setMessageType('info');
      }
    } catch {
      setMessage('Failed to search for user.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const grantClaims = async () => {
    if (!streak || !daysToGrant || granting) return;
    setGranting(true);
    setMessage(null);
    try {
      const newStreak = Math.min(streak.current_streak + daysToGrant, STREAK_GOAL);
      const tagUnlocked = newStreak >= STREAK_GOAL || streak.tag_unlocked;
      const today = new Date().toISOString().split('T')[0];
      const updated = await base44.entities.UserStreak.update(streak.id, {
        current_streak: newStreak,
        last_claimed_date: today,
        total_days_claimed: (streak.total_days_claimed || 0) + daysToGrant,
        tag_unlocked: tagUnlocked,
      });
      setStreak(updated);

      // Auto-assign Discord role if we just hit day 7
      if (tagUnlocked && !streak.tag_unlocked && streak.discord_id) {
        try {
          await base44.functions.invoke('assign-devoted-role', {
            discord_id: streak.discord_id,
            roblox_username: streak.roblox_username,
          });
        } catch {
          /* role assignment may fail if bot lacks permissions — non-blocking */
        }
      }

      setMessage(`Granted ${daysToGrant} day(s). New streak: ${newStreak}/${STREAK_GOAL}${tagUnlocked && !streak.tag_unlocked ? ' — Devoted unlocked!' : ''}`);
      setMessageType('success');
    } catch {
      setMessage('Failed to grant claims.');
      setMessageType('error');
    } finally {
      setGranting(false);
    }
  };

  const msgColor = messageType === 'error' ? 'text-rose-400' : messageType === 'success' ? 'text-emerald-400' : 'text-slate-400';

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
          <Gift className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Quest Claim Grants</h3>
          <p className="text-xs text-slate-500">Give a member free streak claims toward the 7-Day Devoted Quest.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchStreak()}
          placeholder="Roblox username…"
          className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40"
        />
        <button
          onClick={searchStreak}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/25 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </div>

      {streak && (
        <div className="mt-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-white">{streak.roblox_username}</div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-amber-400" /> Streak: {streak.current_streak}/{STREAK_GOAL}</span>
                <span>Total claimed: {streak.total_days_claimed || 0}</span>
                {streak.tag_unlocked && <span className="flex items-center gap-1 text-emerald-400"><Trophy className="h-3 w-3" /> Unlocked</span>}
                {streak.discord_id && <span className="text-[#5865F2]">Discord linked</span>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-slate-400">Days to grant:</label>
            <input
              type="number"
              min="1"
              max="7"
              value={daysToGrant}
              onChange={(e) => setDaysToGrant(Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
              className="w-20 px-2 py-1.5 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/40"
            />
            <button
              onClick={grantClaims}
              disabled={granting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:from-amber-400 hover:to-orange-500 disabled:opacity-50"
            >
              {granting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Grant Claims
            </button>
          </div>
        </div>
      )}

      {message && <p className={`mt-3 text-xs ${msgColor}`}>{message}</p>}
    </div>
  );
}