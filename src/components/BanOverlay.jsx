import { useEffect, useState } from 'react';
import { ShieldBan, Clock, Hash } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { UNLISTED_ID } from '@/lib/unlistedAppeal';
import { WEBSITE_BAN_TYPE } from '@/lib/banAppealGuard';
import BanAppealForm from '@/components/BanAppealForm';
import BanAppealStatus from '@/components/BanAppealStatus';

const label = 'mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500';

export default function BanOverlay({ user }) {
  const [reporting, setReporting] = useState(false);
  const [latest, setLatest] = useState(null);
  const reason = user?.data?.banned_reason || 'Violation of website rules';
  const bannedAt = user?.data?.banned_at;
  const ref = user?.id || 'ip-ban';
  const username = user?.data?.roblox_username || user?.roblox_username;

  useEffect(() => {
    if (!username) return;
    base44.entities.Appeal.filter({ roblox_username: username, moderation_id: UNLISTED_ID, unlisted_type: WEBSITE_BAN_TYPE }, { sort: '-created_date', limit: 1 })
      .then((r) => setLatest(r.items?.[0] || null));
  }, [username, reporting]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-950 border border-white/10 shadow-2xl shadow-black/60">
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-cyan-500" />
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldBan className="h-10 w-10 text-rose-400" />
            </div>
            <h1 className="mt-5 text-3xl font-bold text-white">You've been banned</h1>
            <p className="mt-2 text-base text-slate-400 max-w-md">Your access to the Escape Tsunami Player Portal has been blocked because of repeated or serious rule-breaking.</p>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6">
            <div className={label}>Reason</div>
            <p className="text-base text-white">{reason}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-sm">
            <div>
              <div className={label}>Banned on</div>
              <div className="flex items-center gap-1.5 text-slate-300"><Clock className="h-4 w-4 text-slate-500" />{bannedAt ? new Date(bannedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}</div>
            </div>
            <div className="min-w-0">
              <div className={label}>Reference</div>
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs truncate"><Hash className="h-4 w-4 text-slate-500 shrink-0" />{ref}</div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-6">
            {latest && !reporting && <div className="mb-4"><BanAppealStatus appeal={latest} /></div>}
            {latest?.status === 'Approved' ? null : reporting ? (
              <BanAppealForm user={user} reason={reason} onCancel={() => setReporting(false)} />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setReporting(true)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-base">{latest ? 'Send another report' : 'Report a mistake'}</button>
                <p className="text-xs text-slate-500">Think this was wrong? Staff will review your report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}