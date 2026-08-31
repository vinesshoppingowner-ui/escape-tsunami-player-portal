import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, User, LogOut, RefreshCw } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import VerifyAccount from '@/components/moderations/VerifyAccount';
import ModerationCard from '@/components/moderations/ModerationCard';
import AppealDialog from '@/components/moderations/AppealDialog';
import AppealHistory from '@/components/moderations/AppealHistory';
import NotificationsBell from '@/components/moderations/NotificationsBell';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import AccountStanding from '@/components/moderations/AccountStanding';
import DevSandbox from '@/components/moderations/DevSandbox';
import BugBounty from '@/components/portal/BugBounty';
import WallOfShame from '@/components/portal/WallOfShame';

export default function Portal() {
  const { user, logout } = useAuth();
  const [savedUsername, setSavedUsername] = useState('');

  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeModeration, setActiveModeration] = useState(null);

  // pull verified username from profile once user loads
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
      setAppeals(apps || []);
      setNotifications(notes || []);
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
    try { await base44.auth.updateMe({ roblox_username: username }); } catch {}
  };

  const appealFor = (moderationId) => appeals.find((a) => a.moderation_id === moderationId);

  const openAppeal = (moderation) => {
    setActiveModeration(moderation);
    setDialogOpen(true);
  };

  const submitAppeal = async (reason) => {
    const created = await base44.entities.Appeal.create({
      moderation_id: activeModeration.id,
      roblox_username: savedUsername,
      appeal_reason: reason,
      status: 'Pending',
    });
    base44.functions.invoke('sendAppealWebhook', {
      username: savedUsername,
      moderationType: activeModeration?.moderation_type,
      reason,
      appealId: created?.id,
    }).catch(() => {});
    await loadData(savedUsername);
  };

  const refresh = () => savedUsername && loadData(savedUsername);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Member Portal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="mt-2 text-slate-400">Review your recent in-game moderations and submit appeals.</p>
        </motion.div>

        {/* Verification / records */}
        {!savedUsername ? (
          <VerifyAccount onVerified={handleVerified} />
        ) : (
          <>
            {/* Account standing */}
            <div className="mt-8">
              <AccountStanding moderations={moderations} />
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Active moderations', value: moderations.filter((m) => m.status === 'Active').length },
                { label: 'Appeals submitted', value: appeals.length },
                { label: 'Awaiting decision', value: appeals.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm">
                <span className="inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <RobloxAvatar username={savedUsername} size={28} />
                  <span className="text-slate-300">Verified as</span>
                  <span className="font-semibold text-white">{savedUsername}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationsBell notifications={notifications} onMarkAllRead={markAllRead} />
                <Button size="sm" variant="ghost" onClick={refresh} className="text-slate-300 hover:text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                </Button>
                <Button size="sm" variant="ghost" onClick={() => logout()} className="text-slate-300 hover:text-white hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-1.5" /> Sign out
                </Button>
              </div>
            </div>

            {/* Moderations */}
            <div className="mt-6">
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
                <div className="space-y-4">
                  {moderations.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <ModerationCard
                        moderation={m}
                        appeal={appealFor(m.id)}
                        onAppeal={() => openAppeal(m)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {moderations.filter((m) => m.status === 'Active').length === 0 && <DevSandbox />}
            <AppealHistory appeals={appeals} moderations={moderations} />
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
    </div>
  );
}