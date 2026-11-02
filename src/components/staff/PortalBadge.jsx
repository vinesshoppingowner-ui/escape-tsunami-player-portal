import QrCode from '@/components/staff/QrCode';
import { SITE_CONFIG } from '@/site.config';

/**
 * Printable member access badge. The QR carries the portal sign-in link with the
 * member's account attached — and, when staff supplied it, their password so the
 * scan signs them straight in.
 */
export default function PortalBadge({ email, url, autoSignIn = false }) {
  return (
    <div className="badge-card w-full max-w-[340px] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
      <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
      <div className="px-6 py-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-600">
          {SITE_CONFIG.brand.name}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold tracking-tight">Member Portal</h3>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {autoSignIn ? 'Scan to sign in instantly' : 'Scan to open the sign-in page'}
        </p>

        <div className="mx-auto mt-4 w-fit rounded-xl border border-slate-200 bg-white p-2.5">
          <QrCode value={url} size={216} alt={`Portal badge for ${email}`} />
        </div>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Account</p>
        <p className="mt-0.5 break-all font-mono text-[13px] font-semibold">{email}</p>

        <p className="mt-4 border-t border-slate-200 pt-3 text-[10px] leading-relaxed text-slate-400">
          {autoSignIn
            ? 'Scan with your phone camera — this badge signs you in automatically.'
            : 'Scan with your phone camera, then enter your own password.'}
        </p>
      </div>
    </div>
  );
}