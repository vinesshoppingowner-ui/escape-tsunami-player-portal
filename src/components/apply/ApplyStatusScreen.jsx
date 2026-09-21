import { Link } from 'react-router-dom';
import SiteNav from '@/components/SiteNav';
import { Button } from '@/components/ui/button';

const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  slate: 'bg-white/5 border-white/10 text-slate-400',
};

export default function ApplyStatusScreen({ icon: Icon, tone = 'cyan', title, children, cta = 'Back to Applications', to = '/applications' }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-lg mx-auto px-5 pt-32 pb-20 text-center">
        <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center mx-auto mb-5 ${TONES[tone]}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{title}</h1>
        <div className="mt-3 text-slate-400">{children}</div>
        <Link to={to}>
          <Button className="mt-7 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">{cta}</Button>
        </Link>
      </main>
    </div>
  );
}