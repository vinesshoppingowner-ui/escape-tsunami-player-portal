import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Printer, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { base44 } from '@/api/base44Client';
import SiteNav from '@/components/SiteNav';
import PortalBadge from '@/components/staff/PortalBadge';
import QrModeSelector from '@/components/staff/QrModeSelector';
import QrContentFields from '@/components/staff/QrContentFields';
import { encodeBadgeCredentials } from '@/lib/badgeLogin';
import { isBadgeRevoked } from '@/lib/badgeRevocation';
import BadgeRevocations from '@/components/staff/BadgeRevocations';
import { PORTAL_PAGES, PORTAL_URL, QR_MODES } from '@/lib/qrActions';

const emptyForm = {
  email: '',
  password: '',
  portalPath: PORTAL_PAGES[0].path,
  applicationId: '',
  customUrl: '',
  customLabel: '',
};

export default function StaffQrBadgesPage() {
  const { user } = useAuth();
  const allowed = isOwner(user) || user?.role === 'staff';

  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState(emptyForm);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Access Badges & QR Codes · Escape Tsunami';
  }, []);

  useEffect(() => {
    let alive = true;
    base44.entities.Application.list('-created_date', 50)
      .then((apps) => {
        if (alive) setApplications(Array.isArray(apps) ? apps : apps?.items || []);
      })
      .finally(() => {
        if (alive) setLoadingApps(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!allowed) return <Navigate to="/portal" replace />;

  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setCard(null);
  };

  const generate = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signin') {
      const clean = form.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
        setError('Enter a valid email address.');
        return;
      }
      if (await isBadgeRevoked(clean)) {
        setError("This account's badges are revoked — restore them below before printing a new one.");
        return;
      }
      setCard(
        form.password
          ? {
              url: `${PORTAL_URL}/login?badge=${encodeBadgeCredentials(clean, form.password)}`,
              title: 'Member Portal',
              subtitle: 'Scan to sign in instantly',
              label: 'Account',
              value: clean,
              note: 'Scan with your phone camera — this card signs you in automatically.',
            }
          : {
              url: `${PORTAL_URL}/login?email=${encodeURIComponent(clean)}`,
              title: 'Member Portal',
              subtitle: 'Scan to open the sign-in page',
              label: 'Account',
              value: clean,
              note: 'Scan with your phone camera, then enter your own password.',
            }
      );
      return;
    }

    if (mode === 'portal') {
      const page = PORTAL_PAGES.find((p) => p.path === form.portalPath) || PORTAL_PAGES[0];
      setCard({
        url: `${PORTAL_URL}${page.path}`,
        title: page.label,
        subtitle: 'Scan to open this page',
        label: 'Opens',
        value: page.path,
        note: page.hint.includes('sign in')
          ? 'Members land on the sign-in screen first, then go straight to the page.'
          : 'Scan with your phone camera to open this page in the portal.',
      });
      return;
    }

    if (mode === 'application') {
      const app = applications.find((a) => a.id === form.applicationId);
      if (!app) {
        setError('Choose an application form first.');
        return;
      }
      setCard({
        url: `${PORTAL_URL}/apply/${app.id}`,
        title: app.title,
        subtitle: 'Scan to open this application',
        label: 'Form',
        value: app.status ? `${app.title} — ${app.status}` : app.title,
        note: 'Scan with your phone camera to open the form and start applying.',
      });
      return;
    }

    let parsed;
    try {
      parsed = new URL(form.customUrl.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
    } catch {
      setError('Enter a full link that starts with https://');
      return;
    }
    const name = form.customLabel.trim();
    setCard({
      url: parsed.toString(),
      title: name || 'Quick Link',
      subtitle: 'Scan to open',
      label: 'Destination',
      value: parsed.hostname.replace(/^www\./, ''),
      note: 'Scan with your phone camera to open this link.',
    });
  };

  const activeMode = QR_MODES.find((m) => m.id === mode) || QR_MODES[0];
  const submitLabel = mode === 'signin' ? 'Generate badge' : 'Generate QR card';

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
            <Shield className="h-3.5 w-3.5" /> Staff only
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Badges & QR Codes</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Print a member sign-in badge, or point a code somewhere useful — a portal page, an open
            application, or any link. Scan with the portal's camera button or a phone camera.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <form onSubmit={generate} className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-2 text-xs font-medium text-slate-300">What should it do?</p>
            <QrModeSelector mode={mode} onSelect={switchMode} />

            <div className="mt-5">
              <QrContentFields
                mode={mode}
                form={form}
                onChange={change}
                applications={applications}
                loadingApps={loadingApps}
              />
            </div>

            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

            <button
              type="submit"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white"
            >
              {submitLabel}
            </button>

            <div className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-slate-500">
              <p>{activeMode.hint}</p>
              {mode === 'signin' && form.password && (
                <p className="text-amber-400/90">
                  This card carries the account password — print it only for that member. Anyone who
                  scans it gets into their account.
                </p>
              )}
              {mode !== 'signin' && (
                <p>Nothing personal is stored in the code and nothing expires — reprint any time.</p>
              )}
            </div>
          </form>

          <div className="flex flex-col items-center">
            {card ? (
              <>
                <div className="print-area">
                  <PortalBadge
                    url={card.url}
                    title={card.title}
                    subtitle={card.subtitle}
                    label={card.label}
                    value={card.value}
                    note={card.note}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <Printer className="h-4 w-4" /> Print card
                </button>
                <p className="mt-3 break-all px-2 text-center font-mono text-[10px] text-slate-500">{card.url}</p>
              </>
            ) : (
              <div className="flex h-64 w-full max-w-[340px] items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center text-xs text-slate-500">
                Your printable card appears here
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 max-w-2xl">
          <BadgeRevocations />
        </div>
      </main>
    </div>
  );
}