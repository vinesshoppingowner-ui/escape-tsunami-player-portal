import ModerationFeed from '@/components/moderations/ModerationFeed';
import { ShieldCheck } from 'lucide-react';

export default function ModerationsTab({ portal, onOpenAppeal }) {
  const { moderations, appeals, appealsLocked, loading } = portal;

  if (loading) return null;

  const appealFor = (moderationId) => appeals.find((a) => a.moderation_id === moderationId);

  if (moderations.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] py-20 text-center">
        <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="font-semibold text-lg text-white">Clean record</h3>
        <p className="mt-1.5 text-sm text-slate-400 max-w-sm mx-auto">
          No moderations found. Keep surviving those tsunamis! 🌊
        </p>
      </div>
    );
  }

  return (
    <ModerationFeed
      moderations={moderations}
      appealFor={appealFor}
      onAppeal={onOpenAppeal}
      appealsLocked={appealsLocked}
    />
  );
}