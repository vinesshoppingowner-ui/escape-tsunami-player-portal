import { useEffect, useRef } from 'react';

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
 * Watches for newly published production bundles by polling /index.html
 * and checking on tab focus/visibility change. When a new published build
 * is detected, automatically refreshes the visitor's browser once.
 */
export default function AutoRefreshOnPublish() {
  const initialSigRef = useRef(null);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const currentSig = extractBundleSignature(document);
    if (!currentSig) return; // Dev mode (/src/main.jsx) — skip
    initialSigRef.current = currentSig;

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

    const intervalId = window.setInterval(checkForPublishedUpdate, 25000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForPublishedUpdate();
      }
    };
    window.addEventListener('focus', checkForPublishedUpdate);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', checkForPublishedUpdate);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}