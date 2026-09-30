import { useState } from 'react';
import { Ban } from 'lucide-react';
import BanAppealForm from '@/components/BanAppealForm';

export default function BanOverlay({ user }) {
  const [reporting, setReporting] = useState(false);
  const reason = user?.data?.banned_reason || 'Violation of website rules';
  const bannedAt = user?.data?.banned_at;
  const ref = user?.id || 'ip-ban';
  const box = 'rounded-xl bg-white/[0.04] border border-white/10 p-4 text-sm';

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] rounded-2xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Ban className="h-6 w-6 text-rose-400" />
          <h1 className="text-2xl font-semibold text-white">Banned</h1>
        </div>
        <p className="mt-4 text-sm text-slate-300">We banned your access to this website because of repeated or serious rule-breaking.</p>

        <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">What happened</h2>
        <div className={`${box} space-y-3`}>
          <div><div className="font-medium text-white">Reason:</div><div className="text-slate-400">{reason}</div></div>
          <div>
            <div className="font-medium text-white">Moderator note:</div>
            <div className="text-slate-400">Your account or network has been blocked from the Escape Tsunami Player Portal. If you think this is a mistake, report it below and our staff will take a look.</div>
          </div>
        </div>

        {bannedAt && (
          <>
            <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">Latest activity we reviewed</h2>
            <div className={box}>
              <div className="font-medium text-white">Review date:</div>
              <div className="text-slate-400">{new Date(bannedAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</div>
            </div>
          </>
        )}
        <div className="mt-2 text-[11px] text-slate-600 font-mono">{ref}</div>

        <div className="mt-6">
          {reporting ? (
            <BanAppealForm user={user} reason={reason} onCancel={() => setReporting(false)} />
          ) : (
            <div className="flex justify-end">
              <button onClick={() => setReporting(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm">
                Report a mistake
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}