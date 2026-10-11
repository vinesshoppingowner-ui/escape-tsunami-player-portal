import { motion } from 'framer-motion';
import { ChevronRight, Clock, User as UserIcon, Hash, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppIcon from '@/components/apply/AppIcon';

export default function ApplyIntro({ app, total, user, retake, hasDraft, onStart }) {
  const estMin = Math.max(1, Math.ceil(total * 0.75));
  const closesIn = (() => {
    if (!app.auto_close_at) return null;
    const diff = new Date(app.auto_close_at) - Date.now();
    if (diff <= 0) return null;
    return Math.ceil(diff / 86400000);
  })();

  const infoPills = [
    { icon: Hash, label: `${total} question${total !== 1 ? 's' : ''}` },
    { icon: Clock, label: `~${estMin} min` },
    { icon: UserIcon, label: user?.roblox_username || user?.email || 'Unknown' },
  ];

  return (
    <div className="text-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-5 flex justify-center"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl" />
          <AppIcon icon={app.icon} className="h-20 w-20 relative" emojiClass="text-6xl" />
        </div>
      </motion.div>

      {/* Category badge */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3"
      >
        {app.category || 'Application'}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
      >
        {app.title}
      </motion.h1>

      {/* Description */}
      {app.description && (
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16 }}
          className="mt-4 text-slate-400 leading-relaxed max-w-md mx-auto"
        >
          {app.description}
        </motion.p>
      )}

      {/* Info pills */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-400"
      >
        {infoPills.map((pill, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <pill.icon className="h-3 w-3" />
            {pill.label}
          </span>
        ))}
        {retake.attempt > 1 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-200">
            Attempt #{retake.attempt}
          </span>
        )}
        {closesIn !== null && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300">
            <AlertTriangle className="h-3 w-3" />
            Closes {closesIn <= 1 ? 'today' : `in ${closesIn} days`}
          </span>
        )}
      </motion.div>

      {/* Feedback from last attempt */}
      {retake.latest?.applicant_feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.24 }}
          className="mt-5 text-sm text-slate-300 rounded-xl bg-white/5 border border-white/10 p-3 text-left"
        >
          <span className="text-slate-500">Feedback from last attempt: </span>
          {retake.latest.applicant_feedback}
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.28 }}
      >
        <Button onClick={onStart} size="lg" className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-12 px-8">
          {hasDraft ? 'Continue application' : 'Start application'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </motion.div>
    </div>
  );
}