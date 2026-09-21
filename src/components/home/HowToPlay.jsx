import { motion } from 'framer-motion';
import { Footprints, Users, TrendingUp, RefreshCw } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';

const steps = [
  { num: '01', icon: Footprints, title: 'Sprint', text: 'Escape incoming tsunamis and survive the round.' },
  { num: '02', icon: Users, title: 'Collect', text: 'Find and collect Developers scattered across the map.' },
  { num: '03', icon: TrendingUp, title: 'Upgrade', text: 'Improve your Developers and earn more cash every second.' },
  { num: '04', icon: RefreshCw, title: 'Rebirth', text: 'Reset your progress for permanent bonuses and climb higher.' },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' } }),
};

export default function HowToPlay() {
  return (
    <section className="px-5 py-16">
      <div className="max-w-6xl mx-auto">
        <SectionHeader badge="Getting Started" title="How to play" text="Four steps from spawn to leaderboard." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div key={s.num} variants={fade} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="relative rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">{s.num}</div>
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-cyan-300" />
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-white text-lg">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{s.text}</p>
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-2.5 h-px w-5 bg-gradient-to-r from-cyan-500/40 to-transparent" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}