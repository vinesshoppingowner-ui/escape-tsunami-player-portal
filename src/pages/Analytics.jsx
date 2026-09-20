import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { ShieldAlert, Loader2, BarChart3 } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import AnalyticsStats from '@/components/analytics/AnalyticsStats';
import ModerationAnalytics from '@/components/analytics/ModerationAnalytics';
import AppealAnalytics from '@/components/analytics/AppealAnalytics';
import StaffActivity from '@/components/analytics/StaffActivity';
import StaffSearch from '@/components/analytics/StaffSearch';
import TrendChart from '@/components/analytics/TrendChart';
import ReasonBreakdown from '@/components/analytics/ReasonBreakdown';
import RepeatOffenders from '@/components/analytics/RepeatOffenders';
import ActivityHeatmap from '@/components/analytics/ActivityHeatmap';
import StaffAudit from '@/components/analytics/StaffAudit';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!isOwner(user)) return;
    localStorage.setItem('analytics_last_visited', new Date().toISOString());
    (async () => {
      try {
        const [mods, apps, staffLogs] = await Promise.all([
          base44.entities.Moderation.list('-created_date', 500),
          base44.entities.Appeal.list('-created_date', 500),
          base44.entities.StaffLog.list('-created_date', 500),
        ]);
        setModerations(mods || []);
        setAppeals(apps || []);
        setLogs(staffLogs || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!isOwner(user)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-3xl mx-auto px-5 pt-28 pb-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Owners only</h1>
          <p className="mt-2 text-slate-400">You need an owner account to view analytics.</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <div className="flex items-center justify-center pt-28 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mr-2" /> Loading analytics…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300 mb-4">
          <BarChart3 className="h-3.5 w-3.5" /> Owner Analytics
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Moderation insights</h1>
        <p className="mt-2 text-slate-400">Track moderations, appeals, and staff activity across the portal.</p>

        <AnalyticsStats moderations={moderations} appeals={appeals} logs={logs} />
        <TrendChart moderations={moderations} appeals={appeals} />
        <StaffSearch moderations={moderations} appeals={appeals} logs={logs} />
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <ReasonBreakdown moderations={moderations} />
          <RepeatOffenders moderations={moderations} />
        </div>
        <ActivityHeatmap moderations={moderations} appeals={appeals} />
        <ModerationAnalytics moderations={moderations} />
        <AppealAnalytics appeals={appeals} logs={logs} />
        <StaffAudit moderations={moderations} appeals={appeals} logs={logs} />
        <StaffActivity logs={logs} />
      </main>
    </div>
  );
}