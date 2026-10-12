import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FALLBACK_NOTES = [
  { version: 'v1.3', date: 'Aug 28, 2026', text: 'Tuned wave timing on Map A — you now get a couple extra seconds of warning before the surge hits.' },
  { version: 'v1.2', date: 'Aug 21, 2026', text: 'Fixed water physics that let players clip through the spawn wall on Map B.' },
  { version: 'v1.1', date: 'Aug 14, 2026', text: 'Added the rebirth multiplier and squashed a leaderboard desync bug.' },
];

export default function LatestUpdates() {
  const [notes, setNotes] = useState(FALLBACK_NOTES);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.Announcement.filter(
          { type: 'update', active: true },
          { sort: '-created_date', limit: 3 }
        );
        if (page?.items?.length) {
          setNotes(page.items.map((a) => ({
            version: 'Update',
            date: new Date(a.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            text: a.body,
          })));
        }
      } catch {}
    })();
  }, []);

  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="h-5 w-5 text-cyan-400" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Latest updates</h2>
      </div>
      <div className="grid gap-3">
        {notes.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
          >
            <span className="shrink-0 text-xs font-mono font-semibold text-cyan-300 mt-0.5">{n.version}</span>
            <div className="min-w-0">
              <div className="text-sm text-slate-200">{n.text}</div>
              <div className="text-xs text-slate-500 mt-0.5">{n.date}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}