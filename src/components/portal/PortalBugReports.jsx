import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Bug, Loader2, ChevronRight, ChevronDown, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const STATUS_STYLES = {
  Submitted: { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock },
  Confirmed: { cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: CheckCircle2 },
  Declined: { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle },
};

const SEV_DOT = {
  Low: 'bg-slate-400',
  Medium: 'bg-amber-400',
  High: 'bg-orange-400',
  Critical: 'bg-rose-400',
};

export default function PortalBugReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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
          {reports.map((r) => {
            const expanded = expandedId === r.id;
            const status = STATUS_STYLES[r.status] || STATUS_STYLES.Submitted;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl bg-white/[0.02] border overflow-hidden transition-colors ${expanded ? 'border-cyan-500/25' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                  className="w-full text-left p-3.5 flex items-center gap-3"
                >
                  <span className={`shrink-0 w-2 h-2 rounded-full ${SEV_DOT[r.severity] || 'bg-slate-400'}`} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-white truncate">{r.title}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      {r.severity} · {new Date(r.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </span>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.cls}`}>
                    <StatusIcon className="h-3 w-3" /> {r.status}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5">
                        <div className="pt-3 border-t border-white/5">
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1.5">Description</p>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{r.description}</p>
                          {r.status === 'Confirmed' && (
                            <p className="mt-3 text-xs text-emerald-300/80 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Our team confirmed this bug and is working on a fix.
                            </p>
                          )}
                          {r.status === 'Declined' && (
                            <p className="mt-3 text-xs text-rose-300/80 flex items-center gap-1.5">
                              <XCircle className="h-3.5 w-3.5" /> This was reviewed and not considered a bug.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}