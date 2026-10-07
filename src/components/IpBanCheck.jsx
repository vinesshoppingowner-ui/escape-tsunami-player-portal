import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import BanOverlay from '@/components/BanOverlay';
import {
  generateFingerprint,
  setBanToken,
  hasBanToken,
  hasBanTokenIDB,
  clearBanToken,
  addBannedFingerprint,
  isFingerprintBanned,
  validateClient,
  checkIpIntelligence,
  solveChallenge,
} from '@/lib/banEvasion';
import { useAuth } from '@/lib/AuthContext';
import { getPrefs } from '@/lib/userPrefs';

export default function IpBanCheck({ children }) {
  const [status, setStatus] = useState('checking');
  const { user, isLoadingAuth } = useAuth(); // 'checking' | 'banned' | 'ok'

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1. User-Agent / client validation — block scripts & headless browsers
      if (!validateClient()) {
        if (!cancelled) setStatus('banned');
        return;
      }

      // 2. Check server-side IP ban first (authoritative source of truth)
      let ip = null;
      let serverBanned = false;
      let serverChecked = false;
      try {
        const [ipRes, bans] = await Promise.all([
          fetch('https://api.ipify.org?format=json').then((r) => r.json()),
          base44.entities.IpBan.list(),
        ]);
        if (cancelled) return;
        ip = ipRes.ip;
        serverBanned = bans.some((b) => b.ip_address === ip);
        serverChecked = true;
      } catch {
        // Server unreachable — fail open for the initial check
      }

      // 3. Server confirms ban — persist tokens and block
      if (serverBanned) {
        const fp = await generateFingerprint();
        setBanToken(fp);
        addBannedFingerprint(fp);
        if (!cancelled) setStatus('banned');
        return;
      }

      // 4. Server says NOT banned — clear any stale client-side ban tokens/fingerprints
      if (serverChecked) {
        const hasToken = hasBanToken() || await hasBanTokenIDB();
        const fp = await generateFingerprint();
        if (hasToken || isFingerprintBanned(fp)) {
          clearBanToken();
        }
      } else if (hasBanToken() || await hasBanTokenIDB()) {
        // Server unreachable but stale token exists — keep blocked (fail closed)
        if (!cancelled) setStatus('banned');
        return;
      } else {
        // Server unreachable, no token — check fingerprint as fallback
        const fp = await generateFingerprint();
        if (isFingerprintBanned(fp)) {
          if (!cancelled) setStatus('banned');
          return;
        }
      }

      // 5. IP intelligence — VPN / proxy / hosting / known ASN / Tor / WebRTC leak
      if (serverChecked && ip) {
        try {
          const intel = await checkIpIntelligence(ip);
          if (intel.threat) {
            // Block VPN/proxy/Tor connections entirely
            const fp = await generateFingerprint();
            setBanToken(fp);
            addBannedFingerprint(fp);
            if (!cancelled) setStatus('banned');
            return;
          }
        } catch {
          // Fail open
        }
      }

      if (!cancelled) setStatus('ok');
    })();
    return () => { cancelled = true; };
  }, []);

  // Account-linked ban — block banned users even on a new IP or alternate account
  useEffect(() => {
    if (!isLoadingAuth && user?.data?.banned) {
      setStatus('banned');
    }
  }, [user, isLoadingAuth]);

  // Record the user's IP and last_seen so admins can see it in user lookup
  useEffect(() => {
    if (isLoadingAuth || !user) return;
    (async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json').then((r) => r.json());
        const hidden = getPrefs(user).hide_online_status;
        await base44.auth.updateMe({
          last_ip: ipRes.ip,
          ...(hidden ? { last_seen: null } : { last_seen: new Date().toISOString() }),
        });
      } catch {
        // Non-critical — fail silently
      }
    })();
  }, [user, isLoadingAuth]);

  if (status === 'banned') {
    return (
      <>
        <div className="pointer-events-none select-none" aria-hidden>{children}</div>
        <BanOverlay user={user} />
      </>
    );
  }


  return children;
}