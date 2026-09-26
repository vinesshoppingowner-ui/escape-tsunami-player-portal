import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertCircle, Fingerprint, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { startRobloxLogin } from '@/lib/robloxOAuth';

export default function VerifyAccount() {
  const { user } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  const robloxLogin = async () => {
    setRedirecting(true);
    setError('');
    try {
      await startRobloxLogin();
    } catch {
      setError('Could not start Roblox sign-in. Please try again.');
      setRedirecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-xl shadow-cyan-950/30 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <Fingerprint className="h-6 w-6 text-cyan-300" />
        </div>
        <div>
          <h2 className="font-semibold text-lg leading-tight">Log in with Roblox</h2>
          <p className="text-xs text-slate-500 mt-0.5">Secure identity check</p>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-5">
        Sign in through Roblox to confirm this is your account. This stops anyone from viewing or appealing another player's records.
      </p>

      {user ? (
        <Button
          onClick={robloxLogin}
          disabled={redirecting}
          className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
        >
          {redirecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
          Log in with Roblox
        </Button>
      ) : (
        <a href="/login?returnTo=/portal">
          <Button className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
            <LogIn className="h-4 w-4 mr-2" /> Sign in to continue
          </Button>
        </a>
      )}

      {error && (
        <div className="mt-4 rounded-lg flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
    </motion.div>
  );
}