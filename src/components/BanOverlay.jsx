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
  const username = user?.data?.roblox_username || user?.roblox_username;

  useEffect(() => {
    if (!username) return;
    base44.entities.Appeal.filter({ roblox_username: username, moderation_id: UNLISTED_ID, unlisted_type: WEBSITE_BAN_TYPE }, { sort: '-created_date', limit: 1 })
      .then(async (r) => {
        const a = r.items?.[0] || null;
        // An old approval from before this ban is spent — don't let it reactivate the new ban.
        if (a?.status === 'Approved' && !appealCoversBan(a, await getBanStart(user))) setLatest(null);
        else setLatest(a);
      });
  }, [username, reporting]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-lg bg-slate-900 border border-slate-700 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white">Account banned</h1>
        <p className="mt-1 text-sm text-slate-400">You can't use the Escape Tsunami portal right now.</p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Reason</dt><dd className="text-white text-right">{reason}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Date</dt><dd className="text-slate-300">{bannedAt ? new Date(bannedAt).toLocaleDateString() : '—'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">ID</dt><dd className="text-slate-300 font-mono text-xs truncate">{user?.id || 'ip-ban'}</dd></div>
        </dl>

        <div className="mt-6 border-t border-slate-700 pt-6">
          {latest && !reporting && <div className="mb-4"><BanAppealStatus appeal={latest} /></div>}
          {latest?.status === 'Approved' ? null : reporting ? (
            <BanAppealForm user={user} reason={reason} onCancel={() => setReporting(false)} />
          ) : (
            <button onClick={() => setReporting(true)} className="text-sm text-slate-300 underline underline-offset-4 hover:text-white">
              {latest ? 'Send another report' : 'Think this is a mistake? Let us know'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}