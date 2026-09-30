import { useState } from 'react';
import { ShieldBan, Clock, Hash } from 'lucide-react';
import BanAppealForm from '@/components/BanAppealForm';

const label = 'mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500';

export default function BanOverlay({ user }) {
  const [reporting, setReporting] = useState(false);
  const reason = user?.data?.banned_reason || 'Violation of website rules';
  const bannedAt = user?.data?.banned_at;
  const ref = user?.id || 'ip-ban';

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-950 border border-white/10 shadow-2xl shadow-black/60">
        <div className="h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-cyan-500" />
        <div className="p-7">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldBan className="h-7 w-7 text-rose-400" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">You've been banned</h1>
            <p className="mt-2 text-sm text-slate-400 max-w-sm">Your access to the Escape Tsunami Player Portal has been blocked because of repeated or serious rule-breaking.</p>
          </div>

          <div className="mt-7 border-t border-white/5 pt-5">
            <div className={label}>Reason</div>
            <p className="text-sm text-white">{reason}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-5 text-sm">
            <div>
              <div className={label}>Banned on</div>
              <div className="flex items-center gap-1.5 text-slate-300"><Clock className="h-3.5 w-3.5 text-slate-500" />{bannedAt ? new Date(bannedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}</div>
            </div>
            <div className="min-w-0">
              <div className={label}>Reference</div>
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs truncate"><Hash className="h-3.5 w-3.5 text-slate-500 shrink-0" />{ref}</div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-5">
            {reporting ? (
              <BanAppealForm user={user} reason={reason} onCancel={() => setReporting(false)} />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setReporting(true)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm">Report a mistake</button>
                <p className="text-xs text-slate-500">Think this was wrong? Staff will review your report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}