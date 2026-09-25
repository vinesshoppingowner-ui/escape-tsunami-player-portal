import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SiteNav from '@/components/SiteNav';
import { useAuth } from '@/lib/AuthContext';
import { getRetakeState } from '@/lib/applicationRetake';
import { Loader2, FileText, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

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

  useEffect(() => {
    (async () => {
      try {
        const [apps, responses] = await Promise.all([
          base44.entities.Application.filter({ status: 'open' }, '-created_date', 100),
          user?.id ? base44.entities.ApplicationResponse.filter({ created_by_id: user.id }, '-created_date', 100) : [],
        ]);
        setApplications(apps || []);
        setMyResponses(responses || []);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const retakeFor = (app) => {
    const mine = myResponses.filter((r) => r.application_id === app.id);
    return mine.length ? getRetakeState(JSON.parse(app.settings || '{}'), mine) : null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-4">
          <FileText className="h-3.5 w-3.5" /> Applications
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Open Applications</h1>
        <p className="mt-2 text-slate-400">Apply for staff roles, community programs, and more.</p>

        {myResponses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">My Submissions</h2>
            <div className="space-y-2">
              {myResponses.map((r) => {
                const SI = STATUS_ICONS[r.status] || STATUS_ICONS.submitted;
                const Icon = SI.icon;
                return (
                  <div key={r.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{r.application_title || 'Application'}{r.attempt > 1 && <span className="ml-2 text-[10px] text-amber-300">Attempt #{r.attempt}</span>}</div>
                      <div className="text-xs text-slate-500">Submitted {new Date(r.created_date).toLocaleDateString()}</div>
                      {r.applicant_feedback && <div className="mt-1 text-xs text-slate-300"><span className="text-slate-500">Staff feedback: </span>{r.applicant_feedback}</div>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${SI.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {r.status.replace('_', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Available Applications</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 py-12 text-center">
              <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No applications are currently open.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {applications.map((app) => {
                const rt = retakeFor(app);
                return (
                  <Link key={app.id} to={`/apply/${app.id}`} className="group rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 p-4 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">{app.title}</h3>
                          {rt && (rt.canApply
                            ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/25 shrink-0">Retake available</span>
                            : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 shrink-0">Applied</span>)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{app.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span>{app.category}</span>
                          <span>·</span>
                          <span>{JSON.parse(app.questions || '[]').length} questions</span>
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
    </div>
  );
}