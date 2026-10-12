import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import SiteNav from '@/components/SiteNav';
import VerifyAccount from '@/components/moderations/VerifyAccount';
import AppealDialog from '@/components/moderations/AppealDialog';
import AppealDetailsModal from '@/components/portal/AppealDetailsModal';
import NotificationsBell from '@/components/moderations/NotificationsBell';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { usePortalData } from '@/hooks/usePortalData';
import PortalTabNav from '@/components/portal/PortalTabNav';
import PortalSkeleton from '@/components/portal/PortalSkeleton';
import GuestPreview from '@/components/portal/GuestPreview';
import OverviewTab from '@/components/portal/tabs/OverviewTab';
import ModerationsTab from '@/components/portal/tabs/ModerationsTab';
import AppealsTab from '@/components/portal/tabs/AppealsTab';
import RewardsTab from '@/components/portal/tabs/RewardsTab';
import SecurityTab from '@/components/portal/tabs/SecurityTab';
import SupportTab from '@/components/portal/tabs/SupportTab';

export default function Portal() {
  const portal = usePortalData();
  const { logout } = useAuth();
  const { user, savedUsername, loading, appealsLocked, lastUpdated } = portal;
  const [activeTab, setActiveTab] = useState('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeModeration, setActiveModeration] = useState(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);

  // Guest experience: blurred preview with sign-in overlay
  if (!user) {
    return (
      <>
        <SiteNav />
        <GuestPreview />
      </>
    );
  }

  // Not verified yet
  if (!savedUsername) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-2xl mx-auto px-5 pt-28 pb-20">
          <VerifyAccount onVerified={portal.handleVerified} />
        </main>
      </div>
    );
  }

  const openAppeal = (moderation) => {
    if (appealsLocked) {
      alert('Your ability to submit appeals has been locked by staff. Contact an administrator if you believe this is a mistake.');
      return;
    }
    setActiveModeration(moderation);
    setDialogOpen(true);
  };

  const submitAppeal = async (data) => {
    await portal.submitAppeal(data, activeModeration);
  };

  const badgeCounts = {
    moderations: portal.activeCount,
    appeals: portal.pendingAppeals.length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-5 pt-24 pb-24 md:pb-12">
        {/* Compact header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <RobloxAvatar username={savedUsername} size={40} />
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight truncate">
                {savedUsername}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <a
                  href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(savedUsername)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  Verified as {savedUsername} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <NotificationsBell notifications={portal.notifications} onMarkAllRead={portal.markAllRead} />
            <Button size="sm" variant="ghost" onClick={portal.refresh} className="text-slate-300 hover:text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {user && (
              <Button size="sm" variant="ghost" onClick={() => logout()} className="text-slate-300 hover:text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab navigation + content */}
        <div className="md:flex md:gap-6">
          <PortalTabNav activeTab={activeTab} onTabChange={setActiveTab} badgeCounts={badgeCounts} />

          <div className="flex-1 min-w-0 mt-4 md:mt-0">
            {loading ? (
              <PortalSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && <OverviewTab portal={portal} onTabChange={setActiveTab} />}
                  {activeTab === 'moderations' && <ModerationsTab portal={portal} onOpenAppeal={openAppeal} />}
                  {activeTab === 'appeals' && <AppealsTab portal={portal} />}
                  {activeTab === 'rewards' && <RewardsTab portal={portal} />}
                  {activeTab === 'security' && <SecurityTab portal={portal} />}
                  {activeTab === 'support' && <SupportTab />}
                </motion.div>
              </AnimatePresence>
            )}

            {lastUpdated && !loading && (
              <div className="mt-4 text-xs text-slate-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
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
        appeals={portal.appeals}
        moderations={portal.moderations}
      />
    </div>
  );
}