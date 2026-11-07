import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

function extractBundleSignature(doc) {
  const urls = [];
  doc.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach((el) => {
    const raw = el.getAttribute('src') || el.getAttribute('href') || '';
    if (raw.includes('/assets/')) {
      try {
        const u = new URL(raw, window.location.origin);
        urls.push(u.pathname);
      } catch {
        urls.push(raw.split('?')[0]);
      }
    }
  });
  return urls.sort().join('|');
}

/**
 * Watches for:
 * 1) Newly published production bundles by polling /index.html
 * 2) Real-time owner broadcast reload signals via SiteSettings.force_reload_token
 */
export default function AutoRefreshOnPublish() {
  const initialSigRef = useRef(null);
  const checkingRef = useRef(false);
  const baselineTokenRef = useRef(undefined);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleIncomingToken = (token) => {
      if (!token) return;
      if (baselineTokenRef.current === undefined) {
        baselineTokenRef.current = token;
        return;
      }
      if (token !== baselineTokenRef.current) {
        const lastHandled = sessionStorage.getItem('et_force_reload_token');
        if (lastHandled !== token) {
          sessionStorage.setItem('et_force_reload_token', token);
          window.location.reload();
        } else {
          baselineTokenRef.current = token;
        }
      }
    };

    const fetchLatestToken = async () => {
      try {
        const list = await base44.entities.SiteSettings.list('-updated_date', 1);
        const latest = list?.[0];
        if (latest) {
          if (baselineTokenRef.current === undefined) {
            baselineTokenRef.current = latest.force_reload_token || '';
          } else if (latest.force_reload_token) {
            handleIncomingToken(latest.force_reload_token);
          }
        } else if (baselineTokenRef.current === undefined) {
          baselineTokenRef.current = '';
        }
      } catch {
        // Ignore transient errors
      }
    };

    fetchLatestToken();

    const unsubscribe = base44.entities.SiteSettings.subscribe((event) => {
      const nextToken = event?.data?.force_reload_token;
      if (nextToken) {
        handleIncomingToken(nextToken);
      }
    });

    const tokenPollId = window.setInterval(fetchLatestToken, 10000);

    // Production bundle signature polling
    const currentSig = extractBundleSignature(document);
    let bundleIntervalId = null;

    const checkForPublishedUpdate = async () => {
      if (checkingRef.current || !initialSigRef.current) return;
      checkingRef.current = true;
      try {
        const res = await fetch(`/?_publish_check=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
        if (!res.ok) return;
        const html = await res.text();
        const parser = new DOMParser();
        const remoteDoc = parser.parseFromString(html, 'text/html');
        const remoteSig = extractBundleSignature(remoteDoc);

        if (remoteSig && remoteSig !== initialSigRef.current) {
          const lastReloaded = sessionStorage.getItem('et_reloaded_build_sig');
          if (lastReloaded !== remoteSig) {
            sessionStorage.setItem('et_reloaded_build_sig', remoteSig);
            window.location.reload();
          }
        }
      } catch {
        // Ignore transient network errors
      } finally {
        checkingRef.current = false;
      }
    };

    if (currentSig) {
      initialSigRef.current = currentSig;
      bundleIntervalId = window.setInterval(checkForPublishedUpdate, 25000);
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestToken();
        if (currentSig) checkForPublishedUpdate();
      }
    };
    window.addEventListener('focus', onVisibility);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      unsubscribe?.();
      window.clearInterval(tokenPollId);
      if (bundleIntervalId) window.clearInterval(bundleIntervalId);
      window.removeEventListener('focus', onVisibility);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}