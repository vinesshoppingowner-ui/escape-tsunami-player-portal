import QrCode from '@/components/staff/QrCode';
import { SITE_CONFIG } from '@/site.config';

/**
 * Printable QR card. Staff choose what the code does, so the card is generic:
 * a title, an optional caption, the code, and one detail line.
 */
export default function PortalBadge({
  url,
  title = 'Member Portal',
  subtitle,
  label = 'Account',
  value,
  note,
}) {
  return (
    <div className="badge-card w-full max-w-[340px] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
      <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
      <div className="px-6 py-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-600">
          {SITE_CONFIG.brand.name}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold leading-tight tracking-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}

        <div className="mx-auto mt-4 w-fit rounded-[18px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 p-[2px] shadow-[0_8px_24px_rgba(56,189,248,0.28)]">
          <div className="rounded-[16px] bg-white p-2.5">
            <QrCode value={url} size={216} alt={title} />
          </div>
        </div>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 break-all font-mono text-[12px] font-semibold">{value}</p>

        {note && (
          <p className="mt-4 border-t border-slate-200 pt-3 text-[10px] leading-relaxed text-slate-400">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}