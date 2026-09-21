import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default function PageShell({ badge, icon: Icon, title, text, children, tone = 'cyan', wide = false }) {
  const tones = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <SiteNav />
      <main className={`flex-1 ${wide ? 'max-w-6xl' : 'max-w-4xl'} w-full mx-auto px-5 pt-28 pb-20`}>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-4 ${tones[tone]}`}>
          {Icon && <Icon className="h-3.5 w-3.5" />} {badge}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        {text && <p className="mt-2 text-slate-400 max-w-2xl">{text}</p>}
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}