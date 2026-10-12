import { LogIn, Users, Waves } from 'lucide-react';

const STEPS = [
  { icon: LogIn, title: 'Join', desc: 'Jump into the game on Roblox. It is free to play on every device.' },
  { icon: Users, title: 'Collect', desc: 'Collect your favorite Developers and build a squad that fits your playstyle.' },
  { icon: Waves, title: 'Survive', desc: 'Outrun towering tsunamis, upgrade your gear, and climb the leaderboards.' },
];

export default function HowToPlay() {
  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">How to play</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
              <s.icon className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="text-xs font-mono text-cyan-300 mb-1">STEP {i + 1}</div>
            <h3 className="font-semibold text-white text-sm">{s.title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}