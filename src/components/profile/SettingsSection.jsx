export default function SettingsSection({ icon: Icon, title, desc, children, badge }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-cyan-300" /> {title}{badge}</div>
      {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}