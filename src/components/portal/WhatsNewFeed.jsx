import { motion } from 'framer-motion';
import { Sparkles, Snowflake, Gavel, Bug, Shield } from 'lucide-react';

const UPDATES = [
  { icon: Snowflake, title: 'Winter Edition is here', text: 'Frosty themes, snow particles, and icy UI now live across the portal.', date: 'Sep 17, 2026' },
  { icon: Gavel, title: 'Appeal system upgraded', text: 'Track your appeals with a detailed timeline — Submitted \u2192 Under Review \u2192 Resolved.', date: 'Sep 15, 2026' },
  { icon: Shield, title: 'Account standing dashboard', text: 'See your standing at a glance with a visual risk indicator.', date: 'Sep 12, 2026' },
  { icon: Bug, title: 'Bug report system', text: 'Found a bug? Report it directly from the portal quick links.', date: 'Sep 10, 2026' },
];

export default function WhatsNewFeed() {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2.5 mb-4">
        <Sparkles className="h-5 w-5 text-cyan-400" />
        <h2 className="font-display text-xl font-semibold">What\u2019s new?</h2>
      </div>
      <div className="space-y-3">
        {UPDATES.map((u, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-start gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <u.icon className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-white">{u.title}</h3>
                <span className="text-xs text-slate-500 shrink-0">{u.date}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{u.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}