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
  const [ipBanInfo, setIpBanInfo] = useState(null);
  const { user, isLoadingAuth } = useAuth(); // 'checking' | 'banned' | 'ok'

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Check server-side IP ban (authoritative source of truth)
      let ip = null;
      let serverBanned = false;
      let serverChecked = false;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const [ipRes, bans] = await Promise.all([
          fetch('https://api.ipify.org?format=json', { signal: ctrl.signal }).then((r) => r.json()),
          base44.entities.IpBan.list(),
        ]);
        clearTimeout(timer);
        if (cancelled) return;
        ip = ipRes?.ip;
        const matchedBan = (bans || []).find((b) => b.ip_address === ip) || null;
        serverBanned = Boolean(matchedBan);
        if (matchedBan) setIpBanInfo(matchedBan);
        serverChecked = true;
      } catch {
        // Server or ipify unreachable (e.g. ad-blocker) — clear stale client tokens & allow through
      }

      if (serverBanned) {
        const fp = await generateFingerprint();
        setBanToken(fp);
        addBannedFingerprint(fp);
        if (!cancelled) setStatus('banned');
        return;
      }

      // Not banned in database — clear any stale false-positive client ban tokens
      clearBanToken();
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

  const isBanned = status === 'banned' || Boolean(user?.data?.banned);

  // Secondary parent-level watchdog so removing or hiding the ban overlay in DevTools immediately reloads the page
  useEffect(() => {
    if (!isBanned) return;
    let active = true;
    const checkOverlay = () => {
      if (!active) return;
      const el = document.querySelector('[data-ban-overlay="active"]');
      if (!el || !document.body.contains(el)) {
        active = false;
        window.location.reload();
        return;
      }
      const style = window.getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        parseFloat(style.opacity || '1') < 0.8 ||
        style.pointerEvents === 'none'
      ) {
        active = false;
        window.location.reload();
      }
    };
    const timer = setInterval(checkOverlay, 250);
    const observer = new MutationObserver(checkOverlay);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
    return () => {
      active = false;
      clearInterval(timer);
      observer.disconnect();
    };
  }, [isBanned]);

  if (isBanned) {
    return (
      <BanOverlay
        user={user}
        ipBan={ipBanInfo}
        onAdminUnbanned={() => {
          setIpBanInfo(null);
          setStatus('ok');
        }}
      />
    );
  }

  return children;
}