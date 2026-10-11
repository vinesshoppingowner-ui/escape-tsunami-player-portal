import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield, KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';

export default function StaffPasscodePanel({ account, onReload }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentPasscode = account?.data?.quick_passcode;

  const handleSave = async () => {
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      toast({ title: 'Passcode must be exactly 4 digits', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const existingData = account.data || {};
      await base44.entities.User.update(account.id, {
        data: { ...existingData, quick_passcode: code },
      });
      toast({ title: 'Passcode updated for this user' });
      setCode('');
      setEditing(false);
      if (onReload) onReload();
    } catch (err) {
      toast({ title: 'Failed to update passcode', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      const existingData = account.data || {};
      await base44.entities.User.update(account.id, {
        data: { ...existingData, quick_passcode: null },
      });
      toast({ title: 'Passcode removed for this user' });
      if (onReload) onReload();
    } catch (err) {
      toast({ title: 'Failed to remove passcode', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="h-4 w-4 text-cyan-400" />
        <h4 className="text-sm font-semibold text-white">Quick Login Passcode</h4>
        {currentPasscode ? (
          <span className="ml-auto text-[10px] font-semibold uppercase text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">Set</span>
        ) : (
          <span className="ml-auto text-[10px] font-semibold uppercase text-slate-400 bg-slate-500/10 border border-slate-500/30 rounded-full px-2 py-0.5">None</span>
        )}
      </div>

      {!editing ? (
        <div className="flex items-center gap-2">
          {currentPasscode ? (
            <>
              <div className="flex-1 flex items-center gap-2 rounded-lg bg-slate-950/40 border border-white/5 px-3 py-2">
                <Shield className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-sm text-white font-mono tracking-widest">
                  {show ? currentPasscode : '••••'}
                </span>
                <button
                  onClick={() => setShow((s) => !s)}
                  className="ml-auto text-slate-500 hover:text-slate-300"
                >
                  {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditing(true); setCode(''); }} className="border-white/15 text-white hover:bg-white/5">
                Change
              </Button>
              <Button size="sm" variant="outline" onClick={handleRemove} disabled={saving} className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              </Button>
            </>
          ) : (
            <>
              <p className="flex-1 text-xs text-slate-500">No passcode set. The user must log in with email and password.</p>
              <Button size="sm" onClick={() => { setEditing(true); setCode(''); }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                Add passcode
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            {currentPasscode ? 'Enter a new 4-digit passcode for this user.' : 'Enter a 4-digit passcode for this user.'}
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4-digit code"
              className="bg-slate-950/40 border-white/15 text-white font-mono tracking-widest text-center"
              maxLength={4}
              autoFocus
            />
            <Button size="sm" onClick={handleSave} disabled={saving || code.length !== 4} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setCode(''); }} className="border-white/15 text-white hover:bg-white/5">
              Cancel
            </Button>
          </div>
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">
        Note: Staff-set passcodes sync to the user's device on their next normal login. The user can still log in with email and password anytime.
      </p>
    </div>
  );
}