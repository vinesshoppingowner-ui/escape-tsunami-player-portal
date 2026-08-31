import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Bug } from 'lucide-react';

const SEV_STYLE = {
  Low: 'text-slate-300',
  Medium: 'text-amber-300',
  High: 'text-orange-300',
  Critical: 'text-rose-300',
};

export default function BugReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setReports((await base44.entities.BugReport.list('-created_date', 100)) || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (r, status) => {
    setBusyId(r.id);
    try {
      await base44.entities.BugReport.update(r.id, { status });
      if (status === 'Confirmed') {
        const userReports = await base44.entities.BugReport.filter({ roblox_username: r.roblox_username }, '-created_date', 100);
        const confirmedCount = (userReports || []).filter((x) => x.status === 'Confirmed').length;
        if (confirmedCount === 5) {
          await base44.entities.Notification.create({
            roblox_username: r.roblox_username,
            title: 'Quality Assurance badge earned! 🏆',
            body: "You've had 5 bugs confirmed. Thanks for helping keep Escape Tsunami stable — your QA badge is on the way.",
            type: 'appeal_decision',
            read: false,
          });
        }
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!reports.length) return <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-400"><Bug className="h-7 w-7 mx-auto mb-2 text-slate-600" />No bug reports submitted yet.</div>;

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm">
                <span className="text-cyan-300 font-medium">{r.roblox_username}</span>
                <span className={`ml-2 text-[10px] uppercase ${SEV_STYLE[r.severity] || ''}`}>{r.severity}</span>
              </div>
              <div className="text-sm text-white mt-0.5">{r.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.status === 'Confirmed' ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Confirmed</span>
              ) : r.status === 'Declined' ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300"><XCircle className="h-3.5 w-3.5" /> Declined</span>
              ) : (
                <>
                  <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => setStatus(r, 'Declined')} className="bg-white/5 border-white/15 text-slate-300 hover:bg-white/10">Decline</Button>
                  <Button size="sm" disabled={busyId === r.id} onClick={() => setStatus(r, 'Confirmed')} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border-0">Confirm</Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}