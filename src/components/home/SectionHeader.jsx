export default function SectionHeader({ badge, icon: Icon, title, text, tone = 'cyan' }) {
  const tones = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
  };
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-[0.2em] uppercase mb-4 ${tones[tone]}`}>
        {Icon && <Icon className="h-3.5 w-3.5" />} {badge}
      </div>
      <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">{title}</h2>
      {text && <p className="mt-3 text-slate-400">{text}</p>}
    </div>
  );
}