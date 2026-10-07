import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UNLISTED_ID } from '@/lib/unlistedAppeal';
import { WEBSITE_BAN_TYPE } from '@/lib/banAppealGuard';
import BanAppealForm from '@/components/BanAppealForm';
import BanAppealStatus from '@/components/BanAppealStatus';
import { getBanStart, appealCoversBan } from '@/lib/banStart';

export default function BanOverlay({ user }) {
  const [reporting, setReporting] = useState(false);
  const [latest, setLatest] = useState(null);
  const reason = user?.data?.banned_reason || 'Violation of website rules';
  const bannedAt = user?.data?.banned_at;
  const bannedUntil = user?.data?.banned_until;
  const username = user?.data?.roblox_username || user?.roblox_username;
  const accountName = user?.full_name || user?.email?.split('@')[0] || username || 'Unknown User';

  useEffect(() => {
    if (!username) return;
    base44.entities.Appeal.filter({ roblox_username: username, moderation_id: UNLISTED_ID, unlisted_type: WEBSITE_BAN_TYPE }, { sort: '-created_date', limit: 1 })
      .then(async (r) => {
        const a = r.items?.[0] || null;
        if (a?.status === 'Approved' && !appealCoversBan(a, await getBanStart(user))) setLatest(null);
        else setLatest(a);
      });
  }, [username, reporting]);

  const isTempBan = bannedUntil && new Date(bannedUntil) > new Date();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#101723] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-transparent px-6 pt-8 pb-6 text-center">
          {/* Crossed-out PFP */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="w-20 h-20 rounded-full bg-white/[0.06] border-2 border-white/15 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" strokeDasharray="3 2" />
                <path d="M4 9 L20 20" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="11" r="3.5" />
                <path d="M5 21 L19 21" />
              </svg>
            </div>
            {/* Red prohibition slash overlay */}
            <svg className="absolute inset-0 w-20 h-20 text-rose-500 pointer-events-none" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="3" opacity="0.7" />
              <line x1="12" y1="12" x2="68" y2="68" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">Account banned</h1>
          <p className="mt-1.5 text-sm text-slate-400">You can't use the Escape Tsunami portal right now.</p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
            <Row label="Account" value={accountName} />
            <Row label="Reason" value={reason} />
            <Row label="Date" value={bannedAt ? new Date(bannedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} />
            {isTempBan && (
              <Row label="Expires" value={new Date(bannedUntil).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} accent="text-amber-300" />
            )}
            <Row label="ID" value={user?.id || 'ip-ban'} mono />
          </div>

          <div className="pt-1 border-t border-white/5">
            {latest && !reporting && <div className="mt-4"><BanAppealStatus appeal={latest} /></div>}
            {latest?.status === 'Approved' ? null : reporting ? (
              <BanAppealForm user={user} reason={reason} onCancel={() => setReporting(false)} />
            ) : (
              <button onClick={() => setReporting(true)} className="text-sm text-slate-300 underline underline-offset-4 hover:text-white transition-colors">
                {latest ? 'Send another report' : 'Think this is a mistake? Let us know'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, accent }) {
  return (
    <div className="flex justify-between items-center gap-4 px-4 py-3">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className={`text-sm text-right truncate ${mono ? 'font-mono text-slate-400 text-xs' : 'text-white'} ${accent || ''}`}>{value}</span>
    </div>
  );
}