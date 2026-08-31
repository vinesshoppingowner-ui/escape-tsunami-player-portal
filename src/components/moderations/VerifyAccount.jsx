import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2, User, ShieldCheck, KeyRound, ExternalLink, ArrowRight,
  RefreshCw, AlertCircle, Copy, Check, Hourglass, Search,
} from 'lucide-react';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode() {
  let code = 'ETFD-';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export default function VerifyAccount({ onVerified }) {
  const { user } = useAuth();
  const [step, setStep] = useState('enter'); // 'enter' | 'verify' | 'pending'
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [request, setRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // resume an existing pending request for this app user
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const existing = await base44.entities.VerificationRequest.filter(
          { status: 'pending', created_by_id: user.id }, '-created_date', 1
        );
        if (existing && existing[0]) {
          setRequest(existing[0]);
          setUsername(existing[0].roblox_username);
          setCode(existing[0].code);
          setStep('pending');
        }
      } catch {}
    })();
  }, [user?.id]);

  const startVerification = () => {
    if (!username.trim()) return;
    setError('');
    setCode(generateCode());
    setStep('verify');
  };

  const submitForReview = async () => {
    setSubmitting(true);
    setError('');
    try {
      const created = await base44.entities.VerificationRequest.create({
        roblox_username: username.trim(),
        code,
        status: 'pending',
      });
      setRequest(created);
      setStep('pending');
    } catch {
      setError('Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    setChecking(true);
    setStatusMsg('');
    try {
      const me = await base44.auth.me();
      if (me?.roblox_username) {
        onVerified(me.roblox_username);
      } else {
        setStatusMsg('Still waiting for staff to review your bio — please check back shortly.');
      }
    } catch {
      setStatusMsg('Could not check your status right now.');
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setStep('enter');
    setUsername('');
    setCode('');
    setRequest(null);
    setError('');
    setStatusMsg('');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8"
    >
      {step === 'enter' && (
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Verify your Roblox account</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter your exact Roblox username. We will give you a one-time code to add to your Roblox bio so our staff can confirm the account is really yours — this stops anyone from viewing or appealing another player's records.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="rbx-user" className="sr-only">Roblox username</Label>
                <Input
                  id="rbx-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Roblox username"
                  className="bg-slate-950/50 border-white/15 text-white placeholder:text-slate-500 h-11"
                  onKeyDown={(e) => e.key === 'Enter' && startVerification()}
                />
              </div>
              <Button
                onClick={startVerification}
                disabled={!username.trim()}
                className="h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <KeyRound className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Add this code to your Roblox bio</h2>
              <p className="mt-1 text-sm text-slate-400">
                Verifying as <span className="text-cyan-300 font-medium">{username}</span>. Copy the code, paste it into your Roblox profile bio, save it, then submit for review.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-950/60 border border-white/10 p-4 flex items-center justify-between gap-3">
            <code className="font-mono text-lg sm:text-xl tracking-widest text-cyan-300 font-semibold select-all">{code}</code>
            <Button size="sm" variant="ghost" onClick={copyCode} className="text-slate-300 hover:text-white hover:bg-white/10">
              {copied ? <><Check className="h-4 w-4 mr-1.5 text-emerald-400" /> Copied</> : <><Copy className="h-4 w-4 mr-1.5" /> Copy</>}
            </Button>
          </div>

          <ol className="mt-5 space-y-2 text-sm text-slate-300">
            <li className="flex gap-2.5"><span className="text-cyan-400 font-semibold">1.</span> Open your Roblox profile and edit your bio.</li>
            <li className="flex gap-2.5"><span className="text-cyan-400 font-semibold">2.</span> Paste the code anywhere in the bio and save it.</li>
            <li className="flex gap-2.5"><span className="text-cyan-400 font-semibold">3.</span> Submit for review — our staff will check your bio and approve you.</li>
          </ol>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={submitForReview}
              disabled={submitting}
              className="h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
            >
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : <><ShieldCheck className="h-4 w-4 mr-2" /> Submit for review</>}
            </Button>
            <a href="https://www.roblox.com/users/#!/settings" target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full h-11 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                <ExternalLink className="h-4 w-4 mr-2" /> Open Roblox settings
              </Button>
            </a>
            <Button variant="ghost" onClick={reset} className="text-slate-300 hover:text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4 mr-1.5" /> Start over
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-500">You can remove the code from your bio once staff have approved you.</p>
        </div>
      )}

      {step === 'pending' && (
        <div>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
              <Hourglass className="h-5 w-5 text-amber-300" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Awaiting staff review</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your verification for <span className="text-cyan-300 font-medium">{username}</span> is in the queue. Our staff will check your Roblox bio for the code below and approve you shortly.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-950/60 border border-white/10 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Your code</div>
              <code className="font-mono text-lg tracking-widest text-cyan-300 font-semibold select-all">{code}</code>
            </div>
            <a href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                <Search className="h-4 w-4 mr-1.5" /> Find my profile
              </Button>
            </a>
          </div>

          {statusMsg && (
            <div className="mt-4 flex items-start gap-2 text-sm text-slate-300 bg-white/[0.04] border border-white/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-cyan-300" /> <span>{statusMsg}</span>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={checkStatus}
              disabled={checking}
              className="h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
            >
              {checking ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking…</> : <><RefreshCw className="h-4 w-4 mr-2" /> Check status</>}
            </Button>
            <Button variant="ghost" onClick={reset} className="text-slate-300 hover:text-white hover:bg-white/10">
              Start over
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}