import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ApplyForgot({ onBack }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await base44.auth.resetPasswordRequest(email).catch(() => {});
    setBusy(false);
    setSent(true);
  };

  return sent ? (
    <div className="space-y-3">
      <p className="text-sm text-slate-300">If an account exists for that email, a reset link is on its way.</p>
      <button type="button" onClick={onBack} className="text-xs text-cyan-300 hover:underline">Back to sign in</button>
    </div>
  ) : (
    <form onSubmit={submit} className="space-y-3">
      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
      <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link</Button>
      <button type="button" onClick={onBack} className="w-full text-xs text-slate-400 hover:text-white">Back to sign in</button>
    </form>
  );
}