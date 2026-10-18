import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppIcon from '@/components/apply/AppIcon';
import SubmissionDetailModal from '@/components/apply/SubmissionDetailModal';
import SiteNav from '@/components/SiteNav';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { getRetakeState } from '@/lib/applicationRetake';
import { safeParse } from '@/lib/safeParse';
import { useLiveApplicationResponses, isNewSubmission } from '@/hooks/useLiveApplications';
import { Loader2, FileText, ChevronRight, CheckCircle2, Clock, XCircle, Search, FileQuestion, CalendarClock, Eye, AlertCircle, RefreshCw, Shield, Sparkles } from 'lucide-react';

const STATUS_ICONS = {
  submitted: { icon: Clock, color: 'text-slate-400' },
  under_review: { icon: Clock, color: 'text-violet-400' },
  accepted: { icon: CheckCircle2, color: 'text-emerald-400' },
  rejected: { icon: XCircle, color: 'text-rose-400' },
};
const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};
const statusLabel = (s) => STATUS_LABELS[s] || (s ? s.replace(/_/g, ' ') : 'Submitted');

export default function Applications() {
  const { user, isLoadingAuth } = useAuth();
  const canManage = isOwner(user) || user?.role === 'staff';
  const { totalCount: totalSubmittedCount, newTotalCount } = useLiveApplicationResponses(canManage);
  const [applications, setApplications] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => { document.title = 'Applications · Escape Tsunami for Developers'; }, []);

  useEffect(() => {
    if (isLoadingAuth) return;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [appsPage, responsesPage] = await Promise.all([
          base44.entities.Application.filter({ status: { $in: ['open', 'closed'] } }, { sort: '-created_date', limit: 100 }),
          user?.id ? base44.entities.ApplicationResponse.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 100 }) : { items: [] },
        ]);
        setApplications(appsPage?.items || []);
        setMyResponses(responsesPage?.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();

    if (!user?.id) return;
    const unsubscribe = base44.entities.ApplicationResponse.subscribe((event) => {
      if (!event?.data && event?.type !== 'delete') return;
      if (event.data?.created_by_id && event.data.created_by_id !== user.id) return;
      setMyResponses((prev) => {
        if (event.type === 'create' && event.data) {
          if (prev.some((r) => r.id === event.data.id)) return prev;
          return [event.data, ...prev];
        }
        if (event.type === 'update' && event.data) {
          return prev.map((r) => (r.id === event.data.id ? event.data : r));
        }
        if (event.type === 'delete') {
          return prev.filter((r) => r.id !== event.id);
        }
        return prev;
      });
    });
    return () => unsubscribe?.();
  }, [user?.id, isLoadingAuth]);

  const isExpired = (app) => app.auto_close_at && new Date(app.auto_close_at) < new Date();

  const categories = useMemo(() => {
    const set = new Set(applications.filter((a) => a.status === 'open' && !isExpired(a)).map((a) => a.category || 'General'));
    return ['All', ...Array.from(set).sort()];
  }, [applications]);

  const filtered = useMemo(() => {
    return applications
      .filter((a) => a.status === 'open' && !isExpired(a))
      .filter((a) => {
        const matchCat = activeCategory === 'All' || (a.category || 'General') === activeCategory;
        const q = search.trim().toLowerCase();
        const matchSearch = !q || (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q);
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (!a.auto_close_at && !b.auto_close_at) return 0;
        if (!a.auto_close_at) return 1;
        if (!b.auto_close_at) return -1;
        return new Date(a.auto_close_at) - new Date(b.auto_close_at);
      });
  }, [applications, activeCategory, search]);

  const dedupedResponses = useMemo(() => {
    const counts = {};
    myResponses.forEach((r) => { counts[r.application_id] = (counts[r.application_id] || 0) + 1; });
    const latest = {};
    myResponses.forEach((r) => {
      const key = r.application_id;
      if (!latest[key] || new Date(r.created_date) > new Date(latest[key].created_date)) {
        latest[key] = { ...r, _total: counts[key] };
      }
    });
    return Object.values(latest).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [myResponses]);

  const retakeFor = (app) => {
    const mine = myResponses.filter((r) => r.application_id === app.id);
    return mine.length ? getRetakeState(safeParse(app.settings, {}), mine) : null;
  };

  const deadlineLabel = (app) => {
    if (!app.auto_close_at) return null;
    const diff = new Date(app.auto_close_at) - Date.now();
    if (diff <= 0) return 'Closed';
    const hours = diff / 3600000;
    if (hours <= 24) return `Closes in ${Math.ceil(hours)}h`;
    const days = Math.ceil(hours / 24);
    if (days > 30) return null;
    return `Closes in ${days}d`;
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
          <div className="flex items-center justify-center py-12 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent border border-white/10 p-6 sm:p-8 mb-8">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">
                <FileText className="h-3.5 w-3.5" /> Applications
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Open Applications</h1>
              <p className="mt-2 text-slate-400">Apply for staff roles, community programs, and more.</p>
              {!user && <p className="mt-3 text-sm text-amber-300/80">Sign in to apply for open positions.</p>}
            </div>
            {canManage && (
              <Link
                to="/manage-applications"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-cyan-500/30 text-sm font-semibold text-white shrink-0 transition-colors"
              >
                <Shield className="h-4 w-4 text-cyan-300" />
                <span>Manage Applications</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold tabular-nums">
                  {totalSubmittedCount}
                </span>
                {newTotalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase animate-pulse">
                    <Sparkles className="h-2.5 w-2.5" /> {newTotalCount} New
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* My Submissions */}
        {dedupedResponses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">My Submissions</h2>
            <div className="space-y-2">
              {dedupedResponses.map((r) => {
                const SI = STATUS_ICONS[r.status] || STATUS_ICONS.submitted;
                const Icon = SI.icon;
                const app = applications.find((a) => a.id === r.application_id);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResponse({ ...r, application: app })}
                    className="w-full text-left rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] p-3 flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                        <span>{r.application_title || 'Application'}</span>
                        {isNewSubmission(r.created_date) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse">
                            <Sparkles className="h-2.5 w-2.5" /> New
                          </span>
                        )}
                        {r._total > 1 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">{r._total} attempts</span>}
                      </div>
                      <div className="text-xs text-slate-500">Submitted {new Date(r.created_date).toLocaleDateString()}</div>
                      {r.applicant_feedback && <div className="mt-1 text-xs text-slate-300 truncate"><span className="text-slate-500">Feedback: </span>{r.applicant_feedback}</div>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${SI.color} shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                      {statusLabel(r.status)}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 ml-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats strip */}
        {!loading && !error && (
          <div className="flex items-center gap-3 mb-4 text-sm text-slate-400">
            <span className="text-cyan-300 font-medium">{filtered.length} open</span>
            {dedupedResponses.length > 0 && <span>· {dedupedResponses.length} you've submitted</span>}
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-6">
          <label htmlFor="app-search" className="sr-only">Search applications</label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              id="app-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="w-full h-11 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-slate-500 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
          {categories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:bg-white/[0.06] hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Available Applications */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Available Applications</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 animate-pulse">
                  <div className="h-5 w-3/4 bg-white/5 rounded mb-2" />
                  <div className="h-3 w-full bg-white/5 rounded mb-1" />
                  <div className="h-3 w-2/3 bg-white/5 rounded" />
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="h-8 w-full bg-white/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-rose-500/[0.04] border border-rose-500/15 p-8 text-center">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-white">Couldn't load applications</h2>
              <p className="mt-1 text-sm text-slate-400">Something went wrong. Please try again.</p>
              <button onClick={() => { setLoading(true); setError(false); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-colors">
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 py-12 text-center">
              <FileQuestion className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{search || activeCategory !== 'All' ? 'No applications match your filters.' : 'No applications are currently open.'}</p>
              {!search && activeCategory === 'All' && (
                <a href="https://discord.gg/xtfdNZukN7" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-cyan-300 hover:underline">Join our Discord to hear when applications open</a>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((app) => {
                const rt = retakeFor(app);
                const qCount = safeParse(app.questions, []).length;
                const dl = deadlineLabel(app);
                const alreadyApplied = rt && !rt.canApply;
                const myLatest = myResponses.find((r) => r.application_id === app.id);
                return (
                  <div key={app.id} className="group rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] p-4 transition-all hover:-translate-y-0.5 flex flex-col">
                    <div className="flex items-start gap-3 flex-1">
                      <AppIcon icon={app.icon} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white truncate">{app.title}</h3>
                          {rt && (rt.canApply
                            ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/25 shrink-0">Retake</span>
                            : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 shrink-0">Already Applied</span>)}
                          {dl && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0 inline-flex items-center gap-1"><CalendarClock className="h-2.5 w-2.5" />{dl}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{app.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{app.category}</span>
                          <span>·</span>
                          <span>{qCount} question{qCount !== 1 ? 's' : ''}</span>
                          <span>·</span>
                          <span>~{Math.max(1, Math.ceil(qCount * 0.75))} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      {alreadyApplied && myLatest ? (
                        <button onClick={() => setSelectedResponse({ ...myLatest, application: app })} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-colors">
                          <Eye className="h-4 w-4" /> View submission
                        </button>
                      ) : user ? (
                        <Link to={`/apply/${app.slug || app.id}`} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                          Open application <ChevronRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link to="/login" className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium hover:bg-white/[0.1] transition-colors">
                          Sign in to apply <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SubmissionDetailModal response={selectedResponse} onClose={() => setSelectedResponse(null)} />
    </div>
  );
}