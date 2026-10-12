import AppealHistory from '@/components/moderations/AppealHistory';
import { ScrollText, Lock } from 'lucide-react';

export default function AppealsTab({ portal, onOpenDetails }) {
  const { appeals, moderations, loading, appealsLocked } = portal;

  if (loading) return null;

  return (
    <div className="space-y-4">
      {appealsLocked && (
        <div className="rounded-2xl bg-rose-500/[0.06] border border-rose-500/15 p-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Appeals locked</h3>
            <p className="mt-0.5 text-xs text-slate-400">Your ability to submit appeals has been locked by staff. Contact an administrator if you believe this is a mistake.</p>
          </div>
        </div>
      )}

      {appeals.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] py-16 text-center">
          <div className="h-14 w-14 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center mx-auto mb-4">
            <ScrollText className="h-7 w-7 text-cyan-300" />
          </div>
          <h3 className="font-semibold text-lg text-white">No appeals yet</h3>
          <p className="mt-1.5 text-sm text-slate-400 max-w-sm mx-auto">
            If you have an active moderation, head to the Moderations tab to submit an appeal.
          </p>
        </div>
      ) : (
        <AppealHistory appeals={appeals} moderations={moderations} onViewDetails={onOpenDetails} />
      )}
    </div>
  );
}