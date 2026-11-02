import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Printer, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import SiteNav from '@/components/SiteNav';
import PortalBadge from '@/components/staff/PortalBadge';
import { encodeBadgeCredentials } from '@/lib/badgeLogin';

const PORTAL_URL = 'https://tsunami-shield-portal.base44.app';

export default function StaffQrBadgesPage() {
  const { user } = useAuth();
  const allowed = isOwner(user) || user?.role === 'staff';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [badge, setBadge] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Member Access Badges · Escape Tsunami';
  }, []);

  if (!allowed) return <Navigate to="/portal" replace />;

  const badgeUrl = !badge
    ? ''
    : badge.password
      ? `${PORTAL_URL}/login?badge=${encodeBadgeCredentials(badge.email, badge.password)}`
      : `${PORTAL_URL}/login?email=${encodeURIComponent(badge.email)}`;

  const handleGenerate = (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setBadge({ email: clean, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-28">
        <Link
          to="/manage-applications"
          className="mb-5 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to staff tools
        </Link>

        <div className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <Shield className="h-3.5 w-3.5" /> Staff tool
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Member Access Badges</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Enter a member's email to print a badge. Add their password and scanning the code signs them in
            automatically; leave it blank and they type it themselves.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <form onSubmit={handleGenerate} className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <label htmlFor="badge-email" className="text-xs font-medium text-slate-300">
              Member email
            </label>
            <input
              id="badge-email"
              type="email"
              autoFocus
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />

            <label htmlFor="badge-password" className="mt-4 flex items-center justify-between text-xs font-medium text-slate-300">
              Account password
              <span className="font-normal text-slate-500">optional</span>
            </label>
            <input
              id="badge-password"
              type="password"
              autoComplete="off"
              placeholder="Leave blank to have them type it"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />
            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

            <button
              type="submit"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white"
            >
              Generate badge
            </button>

            <div className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-slate-500">
              {password ? (
                <>
                  <p className="text-amber-400/90">This badge carries the account password and signs the member in automatically.</p>
                  <p>Print it only for that member — anyone who scans it gets into their account.</p>
                </>
              ) : (
                <>
                  <p>The code contains only a link to the portal sign-in page with that email attached.</p>
                  <p>No passwords, no stored records, and nothing that expires or needs revoking.</p>
                </>
              )}
            </div>
          </form>

          <div className="flex flex-col items-center">
            {badge ? (
              <>
                <div className="print-area">
                  <PortalBadge email={badge.email} url={badgeUrl} autoSignIn={Boolean(badge.password)} />
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <Printer className="h-4 w-4" /> Print badge
                </button>
                {!badge.password && (
                  <p className="mt-3 break-all text-center font-mono text-[10px] text-slate-500">{badgeUrl}</p>
                )}
              </>
            ) : (
              <div className="flex h-64 w-full max-w-[340px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                Your printable badge appears here
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}