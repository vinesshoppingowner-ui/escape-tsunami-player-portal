import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { markJustLoggedIn } from '@/lib/userPrefs';

const inp = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500';

export default function ApplyRegister({ returnTo, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('form');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setError(''); setBusy(true);
    try { await fn(); } catch (e) { setError(e?.message || 'Something went wrong'); } finally { setBusy(false); }
  };

  const register = (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    run(async () => { await base44.auth.register({ email, password }); setStage('otp'); });
  };
  const verify = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(r.access_token);
      markJustLoggedIn();
      window.location.href = returnTo;
    });
  };

  return stage === 'form' ? (
    <form onSubmit={register} className="space-y-3">
      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inp} />
      <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inp} />
      <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className={inp} />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account</Button>
      <button type="button" onClick={onBack} className="w-full text-xs text-slate-400 hover:text-white">Already have an account? Sign in</button>
    </form>
  ) : (
    <form onSubmit={verify} className="space-y-3">
      <p className="text-sm text-slate-300">We sent a code to <span className="text-cyan-300">{email}</span>.</p>
      <Input required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Verification code" className={inp} />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify & apply</Button>
      <button type="button" onClick={() => run(() => base44.auth.resendOtp(email))} className="w-full text-xs text-slate-400 hover:text-white">Resend code</button>
    </form>
  );
}