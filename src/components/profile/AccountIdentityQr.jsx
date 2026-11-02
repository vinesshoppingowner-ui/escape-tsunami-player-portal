import { useRef, useState } from 'react';
import { QrCode as QrIcon, Copy, Check, Printer } from 'lucide-react';
import QrCode from '@/components/staff/QrCode';
import { buildAccountQrPayload } from '@/lib/accountQr';

/** The member's own scannable staff ID code — free for everyone. */
export default function AccountIdentityQr({ user }) {
  const [copied, setCopied] = useState(false);
  const qrWrapRef = useRef(null);
  if (!user?.id) return null;

  const copy = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Opens a clean sheet with just the code, so the settings dialog can't clip it.
  const printCode = () => {
    const svg = qrWrapRef.current?.querySelector('svg');
    if (!svg) return;
    const markup = svg.outerHTML.replace(/ width="[^"]*"/, '').replace(/ height="[^"]*"/, '');
    const sheet = window.open('', '_blank', 'width=560,height=760');
    if (!sheet) return;
    sheet.document.write(`<!doctype html><html><head><title>Staff ID Code</title>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 32px; font-family: Inter, system-ui, sans-serif; color: #0f172a; background: #fff; }
  .card { max-width: 380px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 24px; text-align: center; }
  .brand { margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #0891b2; }
  h1 { margin: 6px 0 0; font-size: 19px; }
  .qr { margin: 18px auto 0; width: 280px; height: 280px; display: flex; align-items: center; justify-content: center; }
  .qr svg { width: 280px; height: 280px; }
  .label { margin: 18px 0 0; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }
  .id { margin: 3px 0 0; font-family: ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 600; word-break: break-all; }
  .note { margin: 16px 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; line-height: 1.6; color: #64748b; }
</style></head><body><div class="card">
  <p class="brand">Escape Tsunami</p>
  <h1>Staff ID Code</h1>
  <div class="qr">${markup}</div>
  <p class="label">Account ID</p>
  <p class="id">${user.id}</p>
  <p class="note">Staff scan this code on the staff site to open your account.</p>
</div></body></html>`);
    sheet.document.close();
    sheet.focus();
    setTimeout(() => sheet.print(), 300);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
          <QrIcon className="h-3.5 w-3.5 text-cyan-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Your Staff ID Code</p>
          <p className="text-xs text-slate-400">
            Free to create. Staff scan it on the staff site to pull up your account instantly.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div ref={qrWrapRef} className="rounded-xl bg-white p-2.5">
          <QrCode
            value={buildAccountQrPayload(user.id)}
            size={168}
            alt={`Staff ID code for ${user.email || 'this account'}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Account ID</p>
          <p className="mt-0.5 break-all font-mono text-[11px] text-slate-300">{user.id}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] text-slate-200 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
            <button
              type="button"
              onClick={printCode}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
            >
              <Printer className="h-3 w-3" /> Print code
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            The code holds only your account ID — no email, password or history. Show it from your
            phone screen when staff need your record.
          </p>
        </div>
      </div>
    </div>
  );
}