import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Waves, Home, ArrowLeft, LifeBuoy } from 'lucide-react';
import SiteNav from '@/components/SiteNav';

export default function PageNotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="flex min-h-screen items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <Waves className="h-8 w-8 text-cyan-300" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Error 404</p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold">Swept away by the wave</h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            The page <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-sm text-slate-200">{pathname}</span> doesn't exist or has been moved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Home className="h-4 w-4" /> Back to home
            </Link>
            <button type="button" onClick={() => navigate(-1)} className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-5 text-sm text-slate-200 hover:bg-white/5 hover:border-white/20 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Go back
            </button>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
            Looking for your moderation history?{' '}
            <Link to="/portal" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
              <LifeBuoy className="h-3.5 w-3.5" /> Open the Player Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}