import { useState } from 'react';
import { Loader2, Archive, Users, Activity, Bug, RefreshCw } from 'lucide-react';
import { useAdminDashData } from '@/components/admin/admindash/useAdminDashData';
import AdminDashOverview from '@/components/admin/admindash/AdminDashOverview';
import TicketArchive from '@/components/admin/admindash/TicketArchive';
import StaffActivityPanel from '@/components/admin/admindash/StaffActivityPanel';
import ActivityFeed from '@/components/admin/admindash/ActivityFeed';
import BugReportsPanel from '@/components/admin/admindash/BugReportsPanel';

const SECTIONS = [
  { key: 'tickets', label: 'Old tickets & transcripts', icon: Archive },
  { key: 'staff', label: 'Staff activity', icon: Users },
  { key: 'feed', label: 'Activity feed', icon: Activity },
  { key: 'bugs', label: 'Bug reports', icon: Bug },
];

export default function AdminDashboardTab() {
  const { data, reload } = useAdminDashData();
  const [section, setSection] = useState('tickets');

  if (!data) return <div className="mt-6 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading admin dashboard…</div>;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-amber-100">Admin Dashboard</h2>
        <button onClick={reload} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>
      <AdminDashOverview data={data} />
      <div className="rounded-2xl border border-amber-500/15 bg-white/[0.02] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-1">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${section === key ? 'bg-amber-500/15 text-amber-100 border border-amber-500/30' : 'text-slate-400 border border-transparent hover:text-white hover:bg-white/5'}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        {section === 'tickets' && <TicketArchive appeals={data.appeals} />}
        {section === 'staff' && <StaffActivityPanel logs={data.logs} appeals={data.appeals} />}
        {section === 'feed' && <ActivityFeed logs={data.logs} />}
        {section === 'bugs' && <BugReportsPanel bugs={data.bugs} onChanged={reload} />}
      </div>
    </div>
  );
}