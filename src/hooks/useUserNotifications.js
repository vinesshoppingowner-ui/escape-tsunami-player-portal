import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs, notifAllowed, playNotifSound } from '@/lib/userPrefs';

export const NOTIFICATION_META = {
  appeal_decision: {
    label: 'Appeal Decision',
    badgeCls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    iconCls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    link: '/my-appeals',
    linkLabel: 'View Appeals',
  },
  moderation_issued: {
    label: 'Moderation Issued',
    badgeCls: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    iconCls: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    link: '/portal?tab=moderations',
    linkLabel: 'View Moderations',
  },
  moderation_expired: {
    label: 'Moderation Expired',
    badgeCls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    iconCls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    link: '/portal?tab=moderations',
    linkLabel: 'View Moderations',
  },
  staff_message: {
    label: 'Staff Update',
    badgeCls: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    iconCls: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    link: '/applications',
    linkLabel: 'View Details',
  },
};

export function getNotificationDestination(notif) {
  const meta = NOTIFICATION_META[notif?.type] || NOTIFICATION_META.staff_message;
  const text = `${notif?.title || ''} ${notif?.body || ''}`.toLowerCase();
  if (text.includes('application') || text.includes('retake')) {
    return { link: '/applications', linkLabel: 'View Applications' };
  }
  if (text.includes('appeal')) {
    return { link: '/my-appeals', linkLabel: 'View Appeals' };
  }
  return { link: meta.link, linkLabel: meta.linkLabel };
}

export function useUserNotifications() {
  const { user, isLoadingAuth } = useAuth();
  const prefs = useUserPrefs();
  const username = user?.roblox_username || user?.data?.roblox_username || '';
  const [rawNotifications, setRawNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevUnreadRef = useRef(null);

  const load = useCallback(async () => {
    if (!user) {
      setRawNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const query = username ? { roblox_username: username } : { created_by_id: user.id };
      const page = await base44.entities.Notification.filter(query, {
        sort: '-created_date',
        limit: 50,
      });
      setRawNotifications(page?.items || []);
    } catch {
      // Ignore permission or network errors gracefully
    } finally {
      setLoading(false);
    }
  }, [user, username]);

  useEffect(() => {
    if (isLoadingAuth) return;
    load();
  }, [isLoadingAuth, load]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (!event?.data && event?.type !== 'delete') return;
      if (
        username &&
        event.data?.roblox_username &&
        event.data.roblox_username.toLowerCase() !== username.toLowerCase()
      ) {
        return;
      }
      setRawNotifications((prev) => {
        if (event.type === 'create' && event.data) {
          if (prev.some((n) => n.id === event.data.id)) return prev;
          return [event.data, ...prev];
        }
        if (event.type === 'update' && event.data) {
          return prev.map((n) => (n.id === event.data.id ? event.data : n));
        }
        if (event.type === 'delete') {
          return prev.filter((n) => n.id !== event.id);
        }
        return prev;
      });
    });
    return () => unsubscribe?.();
  }, [user, username]);

  const notifications = rawNotifications.filter((n) => notifAllowed(prefs, n.type));
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current && prefs.notification_sound) {
      try { playNotifSound(); } catch {}
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, prefs.notification_sound]);

  const markRead = useCallback(async (id, read = true) => {
    setRawNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
    try {
      await base44.entities.Notification.update(id, { read });
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = rawNotifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setRawNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      if (username) {
        await base44.entities.Notification.updateMany(
          { roblox_username: username, read: false },
          { $set: { read: true } }
        );
      } else {
        await Promise.all(unreadIds.map((id) => base44.entities.Notification.update(id, { read: true })));
      }
    } catch {}
  }, [rawNotifications, username]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: load,
    markRead,
    markAllRead,
    hasUsername: Boolean(username),
  };
}