import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppIcon from '@/components/apply/AppIcon';
import SubmissionDetailModal from '@/components/apply/SubmissionDetailModal';
import SiteNav from '@/components/SiteNav';
import { useAuth } from '@/lib/AuthContext';
import { getRetakeState } from '@/lib/applicationRetake';
import { Loader2, FileText, ChevronRight, CheckCircle2, Clock, XCircle, Search, FileQuestion } from 'lucide-react';

const STATUS_ICONS = {
  submitted: { icon: Clock, color: 'text-slate-400' },
  under_review: { icon: Clock, color: 'text-violet-400' },
  accepted: { icon: CheckCircle2, color: 'text-emerald-400' },
  rejected: { icon: XCircle, color: 'text-rose-400' },
};

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [apps, responses] = await Promise.all([
          base44.entities.Application.filter({ status: 'open' }, { sort: '-created_date', limit: 100 }),
          user?.id ? base44.entities.ApplicationResponse.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 100 }) : [],
        ]);
        setApplications(apps || []);
        setMyResponses(responses || []);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const categories = useMemo(() => {
    const set = new Set(applications.map((a) => a.category || 'General'));
    return ['All', ...Array.from(set).sort()];
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchCat = activeCategory === 'All' || (a.category || 'General') === activeCategory;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [applications, activeCategory, search]);

  const retakeFor = (app) => {
    const mine = myResponses.filter((r) => r.application_id === app.id);
    return mine.length ? getRetakeState(JSON.parse(app.settings || '{}'), mine) : null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent border border-white/10 p-6 sm:p-8 mb-8">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">
              <FileText className="h-3.5 w-3.5" /> Applications
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Open Applications</h1>
            <p className="mt-2 text-slate-400">Apply for staff roles, community programs, and more.</p>
          </div>
        </div>

        {/* My Submissions */}
        {myResponses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">My Submissions</h2>
            <div className="space-y-2">
              {myResponses.map((r) => {
                const SI = STATUS_ICONS[r.status] || STATUS_ICONS.submitted;
                const Icon = SI.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResponse({ ...r, application: applications.find((a) => a.id === r.application_id) })}
                    className="w-full text-left rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] p-3 flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{r.application_title || 'Application'}{r.attempt > 1 && <span className="ml-2 text-[10px] text-amber-300">Attempt #{r.attempt}</span>}</div>
                      <div className="text-xs text-slate-500">Submitted {new Date(r.created_date).toLocaleDateString()}</div>
                      {r.applicant_feedback && <div className="mt-1 text-xs text-slate-300 truncate"><span className="text-slate-500">Feedback: </span>{r.applicant_feedback}</div>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${SI.color} shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                      {r.status.replace('_', ' ')}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 ml-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-6">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
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
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 py-12 text-center">
              <FileQuestion className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{search || activeCategory !== 'All' ? 'No applications match your filters.' : 'No applications are currently open.'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((app) => {
                const rt = retakeFor(app);
                const qCount = JSON.parse(app.questions || '[]').length;
                return (
                  <Link key={app.id} to={`/apply/${app.id}`} className="group rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] p-4 transition-all hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <AppIcon icon={app.icon} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">{app.title}</h3>
                          {rt && (rt.canApply
                            ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/25 shrink-0">Retake</span>
                            : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 shrink-0">Applied</span>)}
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
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>
                  </Link>
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