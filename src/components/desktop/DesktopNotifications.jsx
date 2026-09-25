import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs, notifAllowed, playNotifSound } from '@/lib/userPrefs';

/**
 * Fires native OS notifications for new portal notifications — but ONLY
 * when the app is running as an installed desktop application. In a regular
 * browser tab this component does nothing.
 *
 * Polls the Notification entity every 20 seconds for the logged-in user's
 * verified Roblox username and shows a system notification for any new ones.
 */
export default function DesktopNotifications({ isDesktopApp }) {
  const { user } = useAuth();
  const seenIds = useRef(new Set());
  const usernameRef = useRef(null);
  const prefsRef = useRef(null);
  prefsRef.current = useUserPrefs();

  useEffect(() => {
    if (!isDesktopApp) return;
    if (!('Notification' in window)) return;

    // Request permission once, silently if already granted/denied
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [isDesktopApp]);

  useEffect(() => {
    if (!isDesktopApp || !user?.roblox_username) return;
    usernameRef.current = user.roblox_username;

    let active = true;

    const poll = async () => {
      if (!active || Notification.permission !== 'granted') return;
      try {
        const notes = await base44.entities.Notification.filter(
          { roblox_username: usernameRef.current },
          '-created_date',
          10
        );
        if (!active || !Array.isArray(notes)) return;

        for (const n of notes) {
          if (seenIds.current.has(n.id)) continue;
          seenIds.current.add(n.id);

          // Don't fire for notifications that existed before the app opened
          const age = Date.now() - new Date(n.created_date).getTime();
          if (age < 60_000 && notifAllowed(prefsRef.current, n.type)) {
            if (prefsRef.current.notification_sound) playNotifSound();
            new Notification(n.title || 'Escape Tsunami', {
              body: n.body || '',
              icon: 'https://media.base44.com/images/public/6a94d0a4d41cd1f012a10c06/b60ae6e74_generated_image.png',
              badge: 'https://media.base44.com/images/public/6a94d0a4d41cd1f012a10c06/b60ae6e74_generated_image.png',
              tag: n.id,
            });
          }
        }
      } catch {
        // silent — polling will retry
      }
    };

    poll();
    const interval = setInterval(poll, 20_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isDesktopApp, user?.roblox_username]);

  return null;
}