import DailyStreakQuest from '@/components/portal/DailyStreakQuest';
import { Trophy, Flame } from 'lucide-react';

const VETERAN_DAYS = 180;

export default function RewardsTab({ portal }) {
  const { savedUsername, daysSinceLast, activeCount } = portal;
  const veteranPct = Math.min(((daysSinceLast ?? 0) / VETERAN_DAYS) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Daily streak quest */}
      <DailyStreakQuest robloxUsername={savedUsername} />

      {/* Veteran progress card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/[0.05] to-white/[0.02] border border-emerald-500/15 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Veteran Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Stay warning-free for {VETERAN_DAYS} days to unlock</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-medium text-emerald-300">{Math.round(veteranPct)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${veteranPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{daysSinceLast ?? 0} days clean</span>
          <span>{Math.max(VETERAN_DAYS - (daysSinceLast ?? 0), 0)} days to go</span>
        </div>

        {activeCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-300/80">
            <Flame className="h-3.5 w-3.5" /> Active moderation{activeCount !== 1 ? 's' : ''} on your account — resolve them to continue progress.
          </div>
        )}
      </div>
    </div>
  );
}