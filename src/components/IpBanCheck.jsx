import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldBan } from 'lucide-react';

export default function IpBanCheck({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'banned' | 'ok'

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ipRes, bans] = await Promise.all([
          fetch('https://api.ipify.org?format=json').then((r) => r.json()),
          base44.entities.IpBan.list(),
        ]);
        if (cancelled) return;
        const isBanned = bans.some((b) => b.ip_address === ipRes.ip);
        setStatus(isBanned ? 'banned' : 'ok');
      } catch {
        // Fail open — don't block access if the check fails
        if (!cancelled) setStatus('ok');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (status === 'banned') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldBan className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-slate-400">
            Your IP address has been banned from this website. If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return children;
}