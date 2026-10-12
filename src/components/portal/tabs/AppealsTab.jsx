import AppealHistory from '@/components/moderations/AppealHistory';
import { ScrollText } from 'lucide-react';

export default function AppealsTab({ portal }) {
  const { appeals, moderations, loading } = portal;

  if (loading) return null;

  if (appeals.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] py-16 text-center">
        <div className="h-14 w-14 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center mx-auto mb-4">
          <ScrollText className="h-7 w-7 text-cyan-300" />
        </div>
        <h3 className="font-semibold text-lg text-white">No appeals yet</h3>
        <p className="mt-1.5 text-sm text-slate-400 max-w-sm mx-auto">
          If you have an active moderation, head to the Moderations tab to submit an appeal.
        </p>
      </div>
    );
  }

  return (
    <AppealHistory appeals={appeals} moderations={moderations} />
  );
}