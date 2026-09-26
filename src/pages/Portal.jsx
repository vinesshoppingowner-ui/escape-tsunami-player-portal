import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, LogOut, RefreshCw, LogIn, Sparkles, ExternalLink, BookOpen, Trophy, ArrowRight, Zap, Gavel, LifeBuoy, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteNav from '@/components/SiteNav';
import VerifyAccount from '@/components/moderations/VerifyAccount';
import ModerationFeed from '@/components/moderations/ModerationFeed';
import AppealDialog from '@/components/moderations/AppealDialog';
import AppealHistory from '@/components/moderations/AppealHistory';
import NotificationsBell from '@/components/moderations/NotificationsBell';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import AccountStanding from '@/components/moderations/AccountStanding';
import SupportCard from '@/components/portal/SupportCard';
import GoodStandingTips from '@/components/portal/GoodStandingTips';
import QuickLinks from '@/components/portal/QuickLinks';
import DailyStreakQuest from '@/components/portal/DailyStreakQuest';
import AppealDetailsModal from '@/components/portal/AppealDetailsModal';
import SecurityCard from '@/components/portal/SecurityCard';
import SectionLabel from '@/components/SectionLabel';
import { sendAppealWebhook } from '@/lib/discordWebhook';
import { emailPlayer } from '@/lib/userEmails';

const COMMUNITY_GUIDELINES_URL = 'https://discord.gg/NCBqfpwPuT';

export default function Portal() {
  const { user, logout } = useAuth();
  const [savedUsername, setSavedUsername] = useState('');

  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeModeration, setActiveModeration] = useState(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);

  const moderationsRef = useRef(null);
  const appealsRef = useRef(null);

  useEffect(() => {
    if (user?.roblox_username) {
      setSavedUsername(user.roblox_username);
    }
  }, [user]);

  const loadData = async (username) => {
    setLoading(true);
    try {
      const [mods, apps, notes] = await Promise.all([
        base44.entities.Moderation.filter({ roblox_username: username }, '-moderation_date', 50),
        base44.entities.Appeal.filter({ roblox_username: username }, '-created_date', 50),
        base44.entities.Notification.filter({ roblox_username: username }, '-created_date', 20),
      ]);
      setModerations(mods || []);
      setAppeals((apps || []).filter((a) => !a.removed));
      setNotifications(notes || []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await base44.entities.Notification.updateMany(
        { roblox_username: savedUsername, read: false },
        { $set: { read: true } }
      );
      const notes = await base44.entities.Notification.filter({ roblox_username: savedUsername }, '-created_date', 20);
      setNotifications(notes || []);
    } catch {}
  };

  useEffect(() => {
    if (savedUsername) loadData(savedUsername);
    else setLoading(false);
  }, [savedUsername]);

  const handleVerified = async (username) => {
    setSavedUsername(username);
    if (user) {
      try { await base44.auth.updateMe({ roblox_username: username }); } catch {}
    }
  };

  const appealFor = (moderationId) => appeals.find((a) => a.moderation_id === moderationId);

  const openAppeal = (moderation) => {
    setActiveModeration(moderation);
    setDialogOpen(true);
  };

  const submitAppeal = async ({ appeal_reason, why_accepted, deserved_infraction }) => {
    const created = await base44.entities.Appeal.create({
      moderation_id: activeModeration.id,
      roblox_username: savedUsername,
      appeal_reason,
      why_accepted,
      deserved_infraction,
      status: 'Pending',
    });
    sendAppealWebhook({
      username: savedUsername,
      moderationType: activeModeration?.moderation_type,
      reason: appeal_reason,
      appealId: created?.id,
    });
    if (user?.email) {
      emailPlayer({
        email: user.email,
        subject: 'Your appeal has been submitted',
        body: `Hi ${savedUsername},\n\nYour appeal for "${activeModeration?.moderation_type || 'your moderation'}" has been received. Our staff team will review it shortly.\n\nYou can track the status in the Member Portal.\n\n— Escape Tsunami Staff Team`,
      });
    }
    await loadData(savedUsername);
  };

  const refresh = () => savedUsername && loadData(savedUsername);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const activeCount = moderations.filter((m) => m.status === 'Active').length;
  const lastModDate = moderations
    .map((m) => m.moderation_date)
    .filter(Boolean)
    .sort()
    .pop();
  const daysSinceLast = lastModDate
    ? Math.floor((Date.now() - new Date(lastModDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const stats = [
    { label: activeCount === 0 ? 'No active issues' : 'Active moderations', value: activeCount === 0 ? 'Healthy' : activeCount, onClick: () => scrollTo(moderationsRef), healthy: activeCount === 0 },
    { label: 'Appeals submitted', value: appeals.length, onClick: () => setAppealModalOpen(true) },
    { label: 'Awaiting decision', value: appeals.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length, onClick: () => setAppealModalOpen(true) },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4 rounded-lg bg-panel border border-white/[0.08] p-5">
            {savedUsername ? <RobloxAvatar username={savedUsername} size={52} /> : (
              <div className="h-[52px] w-[52px] rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"><ShieldCheck className="h-6 w-6 text-cyan-300" /></div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Member Portal</div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {savedUsername ? `Welcome back, ${savedUsername}` : 'Welcome back'}
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">Review your in-game moderations and submit appeals.</p>
            </div>
          </div>
        </motion.div>

        {/* Guest sign-in banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-6 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-600/[0.08] border border-cyan-500/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg shadow-cyan-950/20"
          >
            <div className="h-11 w-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">Browsing as guest</h3>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                You can verify your Roblox account and view your moderations without signing in. Sign in to save your profile, get notifications when your appeals are answered, and unlock more.
              </p>
            </div>
            <Link to="/login" className="shrink-0">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Verification / records */}
        {!savedUsername ? (
          <VerifyAccount onVerified={handleVerified} />
        ) : (
          <>
            {/* Account standing + guidelines link */}
            <div className="mt-8">
              <AccountStanding moderations={moderations} />
              <div className="mt-2">
                <a href={COMMUNITY_GUIDELINES_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  <BookOpen className="h-3.5 w-3.5" /> View Community Guidelines
                </a>
              </div>
            </div>

            {/* Next milestone */}
            {activeCount === 0 && (
              <div className="mt-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 px-4 py-3 flex items-center gap-3">
                <Trophy className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="text-sm">
                  {daysSinceLast !== null ? (
                    <span className="text-slate-300">
                      <span className="font-semibold text-emerald-300">{daysSinceLast} day{daysSinceLast !== 1 ? 's' : ''}</span> without a warning — keep it up! Next milestone: <span className="text-emerald-300">6 months = Veteran status</span>
                    </span>
                  ) : (
                    <span className="text-slate-300">Clean slate — stay warning-free for <span className="text-emerald-300">6 months</span> to earn Veteran status 🏆</span>
                  )}
                </div>
              </div>
            )}

            {/* Stats — clickable */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((s) => (
                <button
                  key={s.label}
                  onClick={s.onClick}
                  className={`rounded-2xl border p-3 sm:p-4 text-left transition-all cursor-pointer ${
                    s.healthy
                      ? 'bg-emerald-500/[0.06] border-emerald-500/20 hover:bg-emerald-500/[0.1] hover:border-emerald-500/30'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-cyan-500/30'
                  }`}
                >
                  <div className={`text-xl sm:text-2xl font-bold ${s.healthy ? 'text-emerald-300' : 'text-white'}`}>{s.value}</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{s.label}</div>
                </button>
              ))}
            </div>

            {/* Status bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm">
                <a
                  href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(savedUsername)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
                >
                  <RobloxAvatar username={savedUsername} size={28} />
                  <span className="text-slate-300">Verified as</span>
                  <span className="font-semibold text-white">{savedUsername}</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <NotificationsBell notifications={notifications} onMarkAllRead={markAllRead} />
                <Button size="sm" variant="ghost" onClick={refresh} className="text-slate-300 hover:text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                </Button>
                {user && (
                  <Button size="sm" variant="ghost" onClick={() => logout()} className="text-slate-300 hover:text-white hover:bg-white/10">
                    <LogOut className="h-4 w-4 mr-1.5" /> Sign out
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <SectionLabel className="mt-8 mb-3">Quick Actions</SectionLabel>

            {/* Quick Links */}
            <QuickLinks />

            {/* 7-Day Streak Quest */}
            <DailyStreakQuest robloxUsername={savedUsername} />

            {/* Last updated */}
            {lastUpdated && (
              <div className="mt-2 text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}

            {/* Your Moderations */}
            <SectionLabel className="mt-8 mb-3">Your Moderations</SectionLabel>

            <div ref={moderationsRef} className="scroll-mt-24">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading your moderations…
                </div>
              ) : moderations.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-20 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Clean record</h3>
                  <p className="mt-1.5 text-sm text-slate-400 max-w-sm mx-auto">
                    No moderations found for <span className="text-cyan-300">{savedUsername}</span>. Keep surviving those tsunamis! 🌊
                  </p>
                </div>
              ) : (
                <ModerationFeed
                  moderations={moderations}
                  appealFor={appealFor}
                  onAppeal={openAppeal}
                  appealsLocked={appeals.some((a) => a.admin_locked)}
                />
              )}
            </div>

            {/* Appeals & Support */}
            <SectionLabel className="mt-8 mb-3">Appeals & Support</SectionLabel>

            <GoodStandingTips />

            <SupportCard />

            <div ref={appealsRef} className="scroll-mt-24">
              <AppealHistory appeals={appeals} moderations={moderations} />
            </div>

            {/* Account Security */}
            <SectionLabel className="mt-8 mb-3">Account Security</SectionLabel>

            <SecurityCard user={user} robloxUsername={savedUsername} />
          </>
        )}
      </main>

      <AppealDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        moderation={activeModeration}
        robloxUsername={savedUsername}
        onSubmit={submitAppeal}
      />

      <AppealDetailsModal
        open={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        appeals={appeals}
        moderations={moderations}
      />
    </div>
  );
}