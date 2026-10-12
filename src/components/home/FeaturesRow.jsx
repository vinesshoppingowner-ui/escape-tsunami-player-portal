import { Users, Zap, Trophy, Moon } from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Collect Developers', desc: 'Build your dream team from a roster of unique Developers, each with their own perks.' },
  { icon: Zap, title: 'Upgrade & Rebirth', desc: 'Boost your stats and rebirth for permanent multipliers that stack with every cycle.' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Climb the global rankings and prove you are the fastest survivor out there.' },
  { icon: Moon, title: 'Earn Offline', desc: 'Your Developers keep earning coins even while you are away. Come back to a payday.' },
];

export default function FeaturesRow() {
  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-2">Why players love it</h2>
      <p className="text-center text-slate-400 text-sm mb-10 max-w-xl mx-auto">Four reasons to jump in today</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/20 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
              <f.icon className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white text-sm">{f.title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}