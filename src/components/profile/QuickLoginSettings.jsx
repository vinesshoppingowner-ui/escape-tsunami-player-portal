import { useState } from 'react';
import { Shield, Check, Trash2, Loader2 } from 'lucide-react';
import PasscodeKeypad from '@/components/profile/PasscodeKeypad';
import { savePasscodeLogin, clearPasscodeLogin, getPasscodeLogin, refreshPasscodeToken, syncPasscodeToServer, clearServerPasscode } from '@/lib/passcodeLogin';
import { useAuth } from '@/lib/AuthContext';

export default function QuickLoginSettings({ user }) {
  const [mode, setMode] = useState(getPasscodeLogin() ? 'set' : 'new'); // 'new' | 'set' | 'create' | 'confirm'
  const [firstCode, setFirstCode] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const existing = getPasscodeLogin();

  const handleCreate = (code) => {
    if (mode === 'create') {
      setFirstCode(code);
      setMode('confirm');
      setError('');
    } else if (mode === 'confirm') {
      if (code !== firstCode) {
        setError('Codes do not match. Try again.');
        setFirstCode('');
        setMode('create');
        return;
      }
      const token = localStorage.getItem('base44_access_token');
      if (!token) { setError('No active session found.'); return; }
      savePasscodeLogin(code, token, user?.email || '', user?.id || '');
      syncPasscodeToServer(code);
      setSaved(true);
      setMode('set');
      setFirstCode('');
      setError('');
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleRemove = () => {
    clearPasscodeLogin();
    clearServerPasscode();
    setMode('new');
    setError('');
  };

  // Keep the stored token fresh
  refreshPasscodeToken();

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white">Quick login passcode</h3>
        {existing && <span className="ml-auto text-[10px] font-semibold uppercase text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">Active</span>}
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Set a 4-digit code so you can log in from this device without typing your email and password.
      </p>

      {saved && (
        <div className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <Check className="h-3.5 w-3.5" /> Passcode saved! Use it on the login page next time.
        </div>
      )}

      {(mode === 'create' || mode === 'confirm') && (
        <div className="py-2">
          <PasscodeKeypad
            key={mode}
            onComplete={handleCreate}
            title={mode === 'create' ? 'Enter a 4-digit code' : 'Confirm your code'}
            subtitle={mode === 'create' ? 'Remember this — you will use it to log in' : 'Enter the same code again'}
          />
          {error && <p className="text-center text-xs text-rose-400 mt-3">{error}</p>}
          <button
            onClick={() => { setMode(existing ? 'set' : 'new'); setFirstCode(''); setError(''); }}
            className="mt-3 mx-auto block text-xs text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'set' && existing && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('create')}
            className="flex-1 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
          >
            Change passcode
          </button>
          <button
            onClick={handleRemove}
            className="h-9 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      )}

      {mode === 'new' && !existing && (
        <button
          onClick={() => setMode('create')}
          className="w-full h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold"
        >
          Set up passcode
        </button>
      )}
    </div>
  );
}