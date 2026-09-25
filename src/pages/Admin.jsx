import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import SiteNav from '@/components/SiteNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShieldAlert, Gavel, Shield, Users, Search, Ban, ScrollText, LayoutDashboard, FileText, MessageSquare, Eye, ScanSearch, Trophy, Megaphone, Crown, UserRound, FileDown } from 'lucide-react';
import PlayersTab from '@/components/admin/players/PlayersTab';
import ReportsTab from '@/components/admin/reports/ReportsTab';
import LiveChatTab from '@/components/admin/LiveChatTab';
import AppealsTab from '@/components/admin/AppealsTab';
import ModerationsTab from '@/components/admin/ModerationsTab';
import UsersTab from '@/components/admin/UsersTab';
import StaffLogsTab from '@/components/admin/StaffLogsTab';
import UserLookup from '@/components/admin/UserLookup';
import WebsiteBansTab from '@/components/admin/WebsiteBansTab';
import DashboardTab from '@/components/admin/DashboardTab';
import ApplicationsTab from '@/components/admin/ApplicationsTab';
import WatchlistTab from '@/components/admin/watchlist/WatchlistTab';
import BanEvasionTab from '@/components/admin/evasion/BanEvasionTab';
import StaffPerformanceTab from '@/components/admin/performance/StaffPerformanceTab';
import MassMessageTab from '@/components/admin/messaging/MassMessageTab';
import AdminMoreMenu from '@/components/admin/AdminMoreMenu';
import AdminOverview from '@/components/admin/AdminOverview';
import QuickPunishButton from '@/components/admin/QuickPunishButton';

const ADMIN_TOOLS = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'performance', label: 'Staff Performance', icon: Trophy },
  { value: 'logs', label: 'Staff Logs', icon: ScrollText },
  { value: 'watchlist', label: 'Watchlist', icon: Eye },
  { value: 'evasion', label: 'Ban Evasion', icon: ScanSearch },
  { value: 'message', label: 'Message Players', icon: Megaphone },
  { value: 'bans', label: 'Website Bans', icon: Ban },
  { value: 'applications', label: 'Applications', icon: FileText },
  { value: 'players', label: 'Player Profiles', icon: UserRound },
  { value: 'reports', label: 'Reports & Export', icon: FileDown },
];

const tabCls = 'shrink-0 gap-1.5 px-3 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg';

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'appeals');

  if (!isOwner(user) && user?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-3xl mx-auto px-5 pt-28 pb-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Staff only</h1>
          <p className="mt-2 text-slate-400">You need a staff or admin account to access this dashboard.</p>
        </main>
      </div>
    );
  }

  const isAdmin = isOwner(user);

  return (
    <div className={`min-h-screen text-white ${isAdmin ? 'bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 bg-slate-950' : 'bg-slate-950'}`}>
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-24">
        {isAdmin ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-200 mb-4">
            <Crown className="h-3.5 w-3.5" /> Administrator
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-300 mb-4">
            <ShieldAlert className="h-3.5 w-3.5" /> Staff Dashboard
          </div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {isAdmin ? 'Admin command center' : 'Moderation console'}
        </h1>
        <p className="mt-2 text-slate-400">
          {isAdmin ? `Welcome back${user?.full_name ? `, ${user.full_name}` : ''} — full control over moderation, staff, and the portal.` : 'Review appeals, issue moderations, and manage staff access.'}
        </p>

        {isAdmin && <AdminOverview />}

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList className="flex w-full justify-start gap-1 p-1.5 bg-white/5 border border-white/10 h-auto rounded-xl">
            <TabsTrigger value="appeals" className={tabCls}><Gavel className="h-3.5 w-3.5" /> Appeals</TabsTrigger>
            <TabsTrigger value="moderations" className={tabCls}><Shield className="h-3.5 w-3.5" /> Moderations</TabsTrigger>
            <TabsTrigger value="lookup" className={tabCls}><Search className="h-3.5 w-3.5" /> User Lookup</TabsTrigger>
            <TabsTrigger value="livechat" className={tabCls}><MessageSquare className="h-3.5 w-3.5" /> Live Chat</TabsTrigger>
            {isAdmin && <AdminMoreMenu items={ADMIN_TOOLS} value={tab} onSelect={setTab} />}
          </TabsList>

          <TabsContent value="appeals"><AppealsTab /></TabsContent>
          <TabsContent value="moderations"><ModerationsTab /></TabsContent>
          <TabsContent value="lookup"><UserLookup /></TabsContent>
          <TabsContent value="livechat"><LiveChatTab /></TabsContent>
          {isAdmin && (
            <>
              <TabsContent value="users"><UsersTab /></TabsContent>
              <TabsContent value="bans"><WebsiteBansTab /></TabsContent>
              <TabsContent value="logs"><StaffLogsTab /></TabsContent>
              <TabsContent value="applications"><ApplicationsTab /></TabsContent>
              <TabsContent value="dashboard"><DashboardTab /></TabsContent>
              <TabsContent value="watchlist"><WatchlistTab /></TabsContent>
              <TabsContent value="evasion"><BanEvasionTab /></TabsContent>
              <TabsContent value="performance"><StaffPerformanceTab /></TabsContent>
              <TabsContent value="message"><MassMessageTab /></TabsContent>
              <TabsContent value="players"><PlayersTab /></TabsContent>
              <TabsContent value="reports"><ReportsTab /></TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <QuickPunishButton />
    </div>
  );
}