import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
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
import PortalFooter from '@/components/portal/PortalFooter';
import OverviewTab from '@/components/portal/tabs/OverviewTab';
import ModerationsTab from '@/components/portal/tabs/ModerationsTab';
import AppealsTab from '@/components/portal/tabs/AppealsTab';
import RewardsTab from '@/components/portal/tabs/RewardsTab';
import SecurityTab from '@/components/portal/tabs/SecurityTab';
import SupportTab from '@/components/portal/tabs/SupportTab';

const TAB_LABELS = {
  overview: 'Overview',
  moderations: 'Moderations',
  appeals: 'Appeals',
  rewards: 'Rewards',
  security: 'Security',
  support: 'Support',
};
const VALID_TABS = Object.keys(TAB_LABELS);

function relativeTime(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Portal() {
  const portal = usePortalData();
  const { logout } = useAuth();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const { isLoadingAuth, user, savedUsername, loading, refreshing, error, appealsLocked, lastUpdated } = portal;

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return VALID_TABS.includes(tab) ? tab : 'overview';
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeModeration, setActiveModeration] = useState(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);

  useEffect(() => {
    document.title = `${TAB_LABELS[activeTab]} · Member Portal`;
  }, [activeTab]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [reduceMotion]);

  // Auth still loading — don't flash guest screen
  if (isLoadingAuth) {
    return (
      <>
        <SiteNav />
        <main className="max-w-4xl mx-auto px-5 pt-24 pb-24">
          <PortalSkeleton />
        </main>
      </>
    );
  }

  // Guest experience
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

  // Error loading data (first load only — on refresh failure, keep old data)
  if (error && !loading && portal.moderations.length === 0 && portal.appeals.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-4xl mx-auto px-5 pt-24 pb-24">
          <div className="rounded-2xl bg-rose-500/[0.04] border border-rose-500/15 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white">Couldn't load your portal</h2>
            <p className="mt-1 text-sm text-slate-400">{error}</p>
            <Button onClick={portal.retry} className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const openAppeal = (moderation) => {
    if (appealsLocked) {
      toast({ title: 'Appeals locked', description: 'Your ability to submit appeals has been locked by staff.', variant: 'destructive' });
      return;
    }
    const existing = portal.appeals.find((a) => a.moderation_id === moderation.id);
    if (existing && !(existing.status === 'Denied' && existing.can_reappeal !== false)) {
      toast({ title: 'Already appealed', description: 'You already have a pending appeal for this moderation.' });
      return;
    }
    setActiveModeration(moderation);
    setDialogOpen(true);
  };

  const submitAppeal = async (data) => {
    try {
      await portal.submitAppeal(data, activeModeration);
      toast({ title: 'Appeal submitted', description: 'Your appeal has been received. We will review it shortly.' });
    } catch (e) {
      toast({ title: 'Failed to submit', description: e.message, variant: 'destructive' });
    }
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
              <a
                href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(savedUsername)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={portal.refresh}
              aria-label="Refresh"
              title="Refresh"
              className="text-slate-300 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => logout()}
              aria-label="Sign out"
              title="Sign out"
              className="text-slate-300 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab navigation + content */}
        <div className="md:flex md:gap-6">
          <PortalTabNav activeTab={activeTab} onTabChange={handleTabChange} badgeCounts={badgeCounts} />

          <div className="flex-1 min-w-0 mt-4 md:mt-0">
            {loading ? (
              <PortalSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? {} : { opacity: 0, y: -4 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                >
                  {activeTab === 'overview' && <OverviewTab portal={portal} onTabChange={handleTabChange} />}
                  {activeTab === 'moderations' && <ModerationsTab portal={portal} onOpenAppeal={openAppeal} />}
                  {activeTab === 'appeals' && <AppealsTab portal={portal} onOpenDetails={() => setAppealModalOpen(true)} />}
                  {activeTab === 'rewards' && <RewardsTab portal={portal} />}
                  {activeTab === 'security' && <SecurityTab portal={portal} />}
                  {activeTab === 'support' && <SupportTab />}
                </motion.div>
              </AnimatePresence>
            )}

            {lastUpdated && !loading && (
              <div className="mt-4 text-xs text-slate-600">
                Updated {relativeTime(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        <PortalFooter />
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