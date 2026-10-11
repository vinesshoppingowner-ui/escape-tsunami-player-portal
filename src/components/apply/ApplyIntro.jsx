import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Clock, 
  User as UserIcon, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppIcon from '@/components/apply/AppIcon';

export default function ApplyIntro({ 
  app = {}, 
  total = 0, 
  user = {}, 
  retake = {}, 
  hasDraft = false, 
  onStart 
}) {
  const estMin = Math.max(1, Math.ceil(total * 0.75));
  
  const closesIn = (() => {
    if (!app?.auto_close_at) return null;
    const diff = new Date(app.auto_close_at) - Date.now();
    if (diff <= 0) return null;
    return Math.ceil(diff / 86400000);
  })();

  const username = user?.roblox_username || user?.username || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="text-center max-w-xl mx-auto px-2">
      {/* 1. App Icon with layered studio glassmorphism */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mb-6 flex justify-center"
      >
        <div className="relative group">
          {/* Ambient colored backdrop glow */}
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-indigo-500/10 blur-xl transition-all duration-500 group-hover:blur-2xl" />
          
          {/* Icon frame container */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.12] shadow-2xl backdrop-blur-md">
            <AppIcon 
              icon={app?.icon} 
              className="h-16 w-16 drop-shadow-md" 
              emojiClass="text-5xl" 
            />
          </div>
        </div>
      </motion.div>

      {/* 2. Category badge with studio pulse */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-medium text-cyan-300 tracking-wide mb-3"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        {app?.category || 'Application'}
      </motion.div>

      {/* 3. Title */}
      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white"
      >
        {app?.title || 'Untitled Application'}
      </motion.h1>

      {/* 4. Description with thoughtful fallback */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16 }}
        className="mt-3 text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-md mx-auto"
      >
        {app?.description || (
          'Please take your time to complete each question accurately. Your answers will be reviewed directly by the studio team.'
        )}
      </motion.p>

      {/* 5. Metadata Badges (Questions, Time, Identity) */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-300"
      >
        {/* Question Count */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-sm backdrop-blur-sm">
          <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
          {total} {total === 1 ? 'Question' : 'Questions'}
        </span>

        {/* Estimated Duration */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-sm backdrop-blur-sm">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          ~{estMin} min
        </span>

        {/* User Identity Pill */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-sm backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <UserIcon className="h-3.5 w-3.5 text-slate-400" />
          <span>Applying as <strong className="text-white font-medium">@{username}</strong></span>
        </span>

        {/* Retake Attempt */}
        {retake?.attempt > 1 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            Attempt #{retake.attempt}
          </span>
        )}

        {/* Closing Notice */}
        {closesIn !== null && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            Closes {closesIn <= 1 ? 'today' : `in ${closesIn} days`}
          </span>
        )}
      </motion.div>

      {/* 6. Previous Attempt Feedback Notice */}
      {retake?.latest?.applicant_feedback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-6 text-xs text-left rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-3.5 text-slate-200 max-w-md mx-auto"
        >
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Reviewer feedback from previous attempt:</span>
          </div>
          <p className="text-slate-300/90 pl-5 italic">
            "{retake.latest.applicant_feedback}"
          </p>
        </motion.div>
      )}

      {/* 7. CTA & Auto-save assurance */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.28 }}
        className="mt-8 flex flex-col items-center"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto"
        >
          <Button 
            onClick={onStart} 
            size="lg" 
            className="w-full sm:w-auto min-w-[220px] h-12 px-7 rounded-xl font-medium text-white shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {hasDraft ? (
              <>
                <RotateCcw className="h-4 w-4" />
                <span>Continue draft</span>
              </>
            ) : (
              <>
                <span>Start application</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Micro-copy to build confidence */}
        <p className="mt-3 text-[11px] text-slate-400/70 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
          Progress saves automatically as you answer
        </p>
      </motion.div>
    </div>
  );
}