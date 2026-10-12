import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Bug, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const STATUS_STYLES = {
  Submitted: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Confirmed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Declined: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const SEVERITY_STYLES = {
  Low: 'text-slate-400',
  Medium: 'text-amber-300',
  High: 'text-orange-300',
  Critical: 'text-rose-300',
};

export default function PortalBugReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const page = await base44.entities.BugReport.filter(
          { created_by_id: user.id },
          { sort: '-created_date', limit: 10 }
        );
        setReports(page?.items || []);
      } catch {} finally {
        setLoading(false);
      }
    })();

    const unsubscribe = base44.entities.BugReport.subscribe((event) => {
      setReports((prev) => {
        if (event.type === 'delete') return prev.filter((r) => r.id !== event.data.id);
        const existing = prev.findIndex((r) => r.id === event.data.id);
        if (existing !== -1) {
          const next = [...prev];
          next[existing] = { ...next[existing], ...event.data };
          return next.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        return [event.data, ...prev];
      });
    });
    return unsubscribe;
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Your Bug Reports</h3>
        </div>
        <Link to="/bug-reports" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] py-8 text-center">
          <Bug className="h-6 w-6 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No bug reports yet.</p>
          <Link to="/bug-reports" className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300">
            Report a bug <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 hover:border-cyan-500/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  <p className={`text-[11px] mt-0.5 ${SEVERITY_STYLES[r.severity] || 'text-slate-400'}`}>{r.severity} severity</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[r.status] || STATUS_STYLES.Submitted}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}