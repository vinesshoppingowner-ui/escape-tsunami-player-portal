import SectionLabel from '@/components/SectionLabel';

export default function ReviewModerationSummary({ moderation, appeal }) {
  if (moderation?.unlisted) {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <div className="text-xs uppercase tracking-wider font-semibold text-amber-300">Punishment not on record</div>
        <p className="mt-1 text-amber-100/80">The player says they received this punishment, but it isn't in their moderation history. Approving won't lift anything automatically.</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {[['Type', appeal.unlisted_type], ['When', appeal.unlisted_date ? new Date(appeal.unlisted_date).toLocaleDateString() : 'Not given'], ['Reason given', appeal.unlisted_reason || 'Not given']].map(([k, v]) => (
            <div key={k}><div className="text-[10px] uppercase text-amber-200/60">{k}</div><div className="text-white">{v}</div></div>
          ))}
        </div>
      </div>
    );
  }
  if (!moderation) return null;
  const meta = [moderation.staff_member, moderation.duration, moderation.moderation_date && new Date(moderation.moderation_date).toLocaleDateString()].filter(Boolean);
  return (
    <div className="space-y-2">
      <SectionLabel>Moderation details</SectionLabel>
      <div className="text-sm"><span className="text-white font-semibold">{moderation.moderation_type}</span>{moderation.reason && <span className="text-slate-400"> — {moderation.reason}</span>}</div>
      {moderation.details && <p className="text-sm text-slate-400">{moderation.details}</p>}
      {meta.length > 0 && <div className="text-xs text-slate-500">{meta.join(' · ')}</div>}
    </div>
  );
}