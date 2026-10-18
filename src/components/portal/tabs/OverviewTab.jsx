import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Bell, Scale, BookOpen, Trophy } from 'lucide-react';
import AccountStanding from '@/components/moderations/AccountStanding';
import SecurityCard from '@/components/portal/SecurityCard';
import GoodStandingTips from '@/components/portal/GoodStandingTips';
import QuickLinks from '@/components/portal/QuickLinks';
import PortalBugReports from '@/components/portal/PortalBugReports';

const VETERAN_DAYS = 180;

export default function OverviewTab({ portal, onTabChange }) {
  const { moderations, appeals, activeCount, daysSinceLast, pendingAppeals, unreadNotifications, appealableModerations, savedUsername, user } = portal;

  const hasActions = activeCount > 0 || pendingAppeals.length > 0 || unreadNotifications.length > 0;

  return (
    <div className="space-y-4">
      {/* Hero: Account Standing */}
      <AccountStanding moderations={moderations} />

      {/* Action-needed strip */}
      {hasActions && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {activeCount > 0 && (
            <button
              onClick={() => onTabChange('moderations')}
              className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/15 hover:border-rose-500/25 transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{activeCount}</div>
                <div className="text-[11px] text-slate-400">Active moderation{activeCount !== 1 ? 's' : ''}</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" />
            </button>
          )}
          {pendingAppeals.length > 0 && (
            <button
              onClick={() => onTabChange('appeals')}
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 hover:border-amber-500/25 transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Scale className="h-4 w-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{pendingAppeals.length}</div>
                <div className="text-[11px] text-slate-400">Appeal{pendingAppeals.length !== 1 ? 's' : ''} pending</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" />
            </button>
          )}
          {unreadNotifications.length > 0 && (
            <button
              onClick={() => onTabChange('appeals')}
              className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/15 hover:border-cyan-500/25 transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{unreadNotifications.length}</div>
                <div className="text-[11px] text-slate-400">Unread notification{unreadNotifications.length !== 1 ? 's' : ''}</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" />
            </button>
          )}
        </div>
      )}

      {/* Veteran progress bar */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/[0.05] to-white/[0.02] border border-emerald-500/15 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Veteran Progress</span>
          </div>
          <span className="text-xs text-slate-400">{daysSinceLast ?? 0} / {VETERAN_DAYS} days</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(((daysSinceLast ?? 0) / VETERAN_DAYS) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {activeCount === 0
            ? daysSinceLast !== null
              ? `${daysSinceLast} day${daysSinceLast !== 1 ? 's' : ''} without a warning — keep it up!`
              : 'Clean slate — stay warning-free for 6 months to earn Veteran status.'
            : 'Resolve your active moderations to continue your progress.'}
        </p>
      </div>

      {/* Companion Studio Cards: Account & Security + Ways to stay in Good Standing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecurityCard user={user} robloxUsername={savedUsername} />
        <GoodStandingTips />
      </div>

      {/* Quick links */}
      <QuickLinks />

      {/* Community guidelines */}
      <a
        href="https://discord.gg/NCBqfpwPuT"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" /> View Community Guidelines
      </a>

      {/* Bug reports */}
      <PortalBugReports />
    </div>
  );
}