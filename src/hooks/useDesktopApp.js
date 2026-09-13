import { useEffect, useState } from 'react';

/**
 * Detects whether the app is running as an installed desktop/PWA app
 * (standalone display mode) rather than in a regular browser tab.
 */
export function useDesktopApp() {
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    const check = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS fallback
      window.navigator.standalone === true;

    setIsDesktopApp(check());

    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsDesktopApp(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  return isDesktopApp;
}