import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function GuestPreview() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen">
      {/* Blurred dashboard preview */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="pt-28 px-5 max-w-4xl mx-auto space-y-4 blur-md opacity-40 select-none">
          <div className="h-24 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.03] border border-white/[0.06]" />
            ))}
          </div>
          <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
          <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
        </div>
        <div className="absolute inset-0 bg-[#0B0D13]/40" />
      </div>

      {/* Sign in overlay */}
      <div className="relative flex items-center justify-center min-h-screen px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-sm w-full text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="h-8 w-8 text-cyan-300" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Member Portal</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Track your moderation history, submit appeals, claim daily rewards, and manage your account — all in one place.
          </p>
          <div className="mt-6">
            {user ? (
              <Link to="/portal">
                <Button className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                  <Fingerprint className="h-4 w-4 mr-2" /> Verify your Roblox account
                </Button>
              </Link>
            ) : (
              <Link to="/login?returnTo=/portal">
                <Button className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                  <Lock className="h-4 w-4 mr-2" /> Sign in to unlock <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
          {!user && (
            <p className="mt-3 text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register?returnTo=/portal" className="text-cyan-400 hover:text-cyan-300">Create one</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}