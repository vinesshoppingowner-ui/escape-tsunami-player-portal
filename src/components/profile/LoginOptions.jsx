import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { isRememberEnabled, setRememberEnabled } from '@/lib/savedLogin';

export default function LoginOptions({ user }) {
  const [remember, setRemember] = useState(isRememberEnabled());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggle = (on) => { setRememberEnabled(on, user?.email || ''); setRemember(on); };

  const setPassword = async () => {
    setSending(true);
    await base44.auth.resetPasswordRequest(user.email).catch(() => {});
    setSending(false);
    setSent(true);
  };

  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <label className="flex items-start justify-between gap-4 cursor-pointer">
        <span>
          <span className="block text-sm font-medium text-white">Auto-fill my login on this device</span>
          <span className="block text-xs text-slate-500">Fills in your email and password on the login page. Only applies to this browser.</span>
        </span>
        <Switch checked={remember} onCheckedChange={toggle} />
      </label>
      <div>
        <p className="text-sm font-medium text-white">Email & password login</p>
        <p className="text-xs text-slate-500 mb-2">Signed up with Google? Set a password so you can also log in with {user?.email}.</p>
        <button type="button" onClick={setPassword} disabled={sending || sent || !user?.email}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {sent ? 'Check your email for the link' : 'Set / change password'}
        </button>
      </div>
    </div>
  );
}