import { useState } from 'react';
import { QrCode as QrIcon, Copy, Check } from 'lucide-react';
import QrCode from '@/components/staff/QrCode';
import { buildAccountQrPayload } from '@/lib/accountQr';

/** The member's own scannable staff ID code — free for everyone. */
export default function AccountIdentityQr({ user }) {
  const [copied, setCopied] = useState(false);
  if (!user?.id) return null;

  const copy = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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
        <div className="rounded-xl bg-white p-2.5">
          <QrCode
            value={buildAccountQrPayload(user.id)}
            size={168}
            alt={`Staff ID code for ${user.email || 'this account'}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Account ID</p>
          <p className="mt-0.5 break-all font-mono text-[11px] text-slate-300">{user.id}</p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] text-slate-200 transition-colors hover:border-white/20 hover:bg-white/5"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            The code holds only your account ID — no email, password or history. Show it from your
            phone screen when staff need your record.
          </p>
        </div>
      </div>
    </div>
  );
}