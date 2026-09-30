import { Ban } from 'lucide-react';

export default function BanOverlay({ user }) {
  const reason = user?.data?.banned_reason || 'Violation of website rules';
  const bannedAt = user?.data?.banned_at;
  const ref = user?.id || 'ip-ban';

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center sm:justify-end p-3 sm:p-6">
      <div className="w-full max-w-md h-full max-h-[720px] rounded-2xl bg-slate-100 text-slate-900 shadow-2xl flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Ban className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-semibold text-slate-900">Banned</h1>
        </div>
        <p className="mt-5 text-sm text-slate-700">We banned your access to this website because of repeated or serious rule-breaking.</p>

        <h2 className="mt-6 mb-2 text-base font-semibold text-slate-900">What happened</h2>
        <div className="rounded-xl bg-slate-200/70 p-4 text-sm space-y-3">
          <div><div className="font-medium text-slate-800">Reason:</div><div className="text-slate-600">{reason}</div></div>
          <div>
            <div className="font-medium text-slate-800">Moderator note:</div>
            <div className="text-slate-600">Your account or network has been blocked from the Escape Tsunami Player Portal. If you think this is a mistake, report it below and our staff will take a look.</div>
          </div>
        </div>

        {bannedAt && (
          <>
            <h2 className="mt-6 mb-2 text-base font-semibold text-slate-900">Latest activity we reviewed</h2>
            <div className="rounded-xl bg-slate-200/70 p-4 text-sm">
              <div className="font-medium text-slate-800">Review date:</div>
              <div className="text-slate-600">{new Date(bannedAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</div>
            </div>
          </>
        )}
        <div className="mt-2 text-[11px] text-slate-500 font-mono">{ref}</div>

        <div className="mt-auto pt-6 flex justify-end">
          <a href="https://discord.gg/escapetsunami" target="_blank" rel="noreferrer"
            className="rounded-xl bg-emerald-200 hover:bg-emerald-300 text-slate-900 text-sm font-medium px-5 py-3 transition-colors">
            Report a mistake
          </a>
        </div>
      </div>
    </div>
  );
}