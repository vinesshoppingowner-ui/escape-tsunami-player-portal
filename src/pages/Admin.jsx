import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AdminMoreMenu from '@/components/admin/AdminMoreMenu';
import { isOwner } from '@/lib/isOwner';
import SiteNav from '@/components/SiteNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShieldAlert, Gavel, Shield, Users, Search, Ban, ScrollText, LayoutDashboard, FileText, MessageSquare } from 'lucide-react';
import LiveChatTab from '@/components/admin/LiveChatTab';
import AppealsTab from '@/components/admin/AppealsTab';
import ModerationsTab from '@/components/admin/ModerationsTab';
import UsersTab from '@/components/admin/UsersTab';
import StaffLogsTab from '@/components/admin/StaffLogsTab';
import UserLookup from '@/components/admin/UserLookup';
import WebsiteBansTab from '@/components/admin/WebsiteBansTab';
import DashboardTab from '@/components/admin/DashboardTab';
import ApplicationsTab from '@/components/admin/ApplicationsTab';

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('appeals');

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

  const moreItems = isAdmin
    ? [
        { value: 'users', label: 'Users', icon: Users },
        { value: 'bans', label: 'Website Bans', icon: Ban },
        { value: 'logs', label: 'Staff Logs', icon: ScrollText },
        { value: 'applications', label: 'Applications', icon: FileText },
        { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-20">
        <h1 className="font-display text-3xl sm:text-[2.6rem] font-extrabold tracking-[-0.03em] leading-[1.05]">Moderation console</h1>
        <p className="mt-2 text-slate-400">Appeals, warnings, bans, and who did what.</p>

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList className="flex w-full justify-start gap-1 p-1.5 bg-white/5 border border-white/10 h-auto rounded-xl">
            <TabsTrigger value="appeals" className="shrink-0 gap-1.5 px-3 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg"><Gavel className="h-3.5 w-3.5" /> Appeals</TabsTrigger>
            <TabsTrigger value="moderations" className="shrink-0 gap-1.5 px-3 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg"><Shield className="h-3.5 w-3.5" /> Moderations</TabsTrigger>
            <TabsTrigger value="lookup" className="shrink-0 gap-1.5 px-3 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg"><Search className="h-3.5 w-3.5" /> User Lookup</TabsTrigger>
            <TabsTrigger value="livechat" className="shrink-0 gap-1.5 px-3 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg"><MessageSquare className="h-3.5 w-3.5" /> Live Chat</TabsTrigger>
            <AdminMoreMenu items={moreItems} value={tab} onSelect={setTab} />
          </TabsList>
          <TabsContent value="appeals"><AppealsTab /></TabsContent>
          <TabsContent value="moderations"><ModerationsTab /></TabsContent>
          {isAdmin && <TabsContent value="users"><UsersTab /></TabsContent>}
          <TabsContent value="lookup"><UserLookup /></TabsContent>
          <TabsContent value="livechat"><LiveChatTab /></TabsContent>
          {isAdmin && <TabsContent value="bans"><WebsiteBansTab /></TabsContent>}
          {isAdmin && <TabsContent value="logs"><StaffLogsTab /></TabsContent>}
          {isAdmin && <TabsContent value="applications"><ApplicationsTab /></TabsContent>}
          {isAdmin && <TabsContent value="dashboard"><DashboardTab /></TabsContent>}
          </Tabs>
      </main>
    </div>
  );
}