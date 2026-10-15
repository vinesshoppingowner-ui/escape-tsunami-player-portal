import { Siren, ShieldCheck, RefreshCw, LogIn } from 'lucide-react';

export default function LockdownScreen({ message, signedIn }) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center px-5 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-red-700/10 blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative max-w-lg w-full text-center py-10">
        <div className="mx-auto mb-8 h-24 w-24 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
          <Siren className="h-12 w-12 text-rose-400 animate-pulse-slow" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold uppercase tracking-wide text-rose-300 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse-slow" /> Lockdown Active
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">The portal is temporarily down</h1>
        <p className="mt-3 text-slate-400 text-base leading-relaxed">
          {message || 'The Escape Tsunami for Developers portal is in lockdown while staff handle an incident. Please check back soon.'}
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Only staff can access the website during a lockdown.</span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-5">
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-rose-300 hover:text-rose-200 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
          {!signedIn && (
            <a href="/login" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <LogIn className="h-3.5 w-3.5" /> Staff sign in
            </a>
          )}
        </div>
      </div>
    </div>
  );
}