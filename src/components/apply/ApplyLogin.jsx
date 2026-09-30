import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@/components/GoogleIcon';
import { markJustLoggedIn } from '@/lib/userPrefs';
import ApplyRegister from '@/components/apply/ApplyRegister';
import ApplyForgot from '@/components/apply/ApplyForgot';
import AppIcon from '@/components/apply/AppIcon';

const inp = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500';
const SUBTITLE = { login: 'Sign in to start your application.', register: 'Create an account to apply.', forgot: 'Reset your password.' };

export default function ApplyLogin({ app }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const returnTo = window.location.pathname + window.location.search;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      markJustLoggedIn();
      window.location.href = returnTo;
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
        <div className="h-2 bg-cyan-500" />
        <div className="p-7">
          <AppIcon icon={app.icon} className="h-12 w-12" emojiClass="text-4xl" />
          <h1 className="mt-3 font-display text-2xl font-bold">{app.title}</h1>
          {app.description && <p className="mt-1 text-sm text-slate-400 line-clamp-3">{app.description}</p>}
          <p className="mt-5 mb-4 text-sm text-slate-300">{SUBTITLE[mode]}</p>

          {mode !== 'forgot' && (
            <>
              <Button type="button" onClick={() => base44.auth.loginWithProvider('google', returnTo)} className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10">
                <GoogleIcon /> Continue with Google
              </Button>
              <div className="my-4 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
            </>
          )}

          {mode === 'register' && <ApplyRegister returnTo={returnTo} onBack={() => setMode('login')} />}
          {mode === 'forgot' && <ApplyForgot onBack={() => setMode('login')} />}
          {mode === 'login' && (
            <>
              <form onSubmit={submit} className="space-y-3">
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inp} />
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inp} />
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in & apply
                </Button>
              </form>
              <div className="mt-4 flex justify-between text-xs text-slate-400">
                <button type="button" onClick={() => setMode('forgot')} className="hover:text-white">Forgot password?</button>
                <button type="button" onClick={() => setMode('register')} className="text-cyan-300 hover:underline">Create an account</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}