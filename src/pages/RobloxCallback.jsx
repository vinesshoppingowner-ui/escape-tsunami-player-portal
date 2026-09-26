import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ROBLOX_STATE_KEY } from '@/lib/robloxOAuth';

export default function RobloxCallback() {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const expected = sessionStorage.getItem(ROBLOX_STATE_KEY);
    sessionStorage.removeItem(ROBLOX_STATE_KEY);

    if (params.get('error')) { setError('Roblox sign-in was cancelled.'); return; }
    if (!code || !state || state !== expected) { setError('This sign-in link is invalid or expired. Please try again.'); return; }

    base44.functions.invoke('robloxOAuth', { action: 'callback', code })
      .then(() => { window.location.href = '/portal'; })
      .catch((e) => setError(e?.response?.data?.error || 'Roblox verification failed. Please try again.'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5">
      <div className="max-w-sm w-full rounded-2xl bg-white/[0.03] border border-white/10 p-8 text-center">
        {error ? (
          <>
            <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
            <p className="text-sm text-slate-300">{error}</p>
            <Link to="/portal" className="inline-block mt-5 text-sm text-cyan-300 hover:text-cyan-200">Back to Member Portal</Link>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300 mx-auto mb-3" />
            <p className="text-sm text-slate-300">Verifying your Roblox account…</p>
          </>
        )}
      </div>
    </div>
  );
}