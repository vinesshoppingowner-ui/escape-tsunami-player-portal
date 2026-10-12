export default function PortalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.03] border border-white/[0.06]" />
        ))}
      </div>
      <div className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.06]" />
      <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
      <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
    </div>
  );
}