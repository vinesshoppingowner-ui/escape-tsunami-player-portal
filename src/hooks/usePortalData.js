import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { emailPlayer } from '@/lib/userEmails';

export function usePortalData() {
  const { user } = useAuth();
  const [savedUsername, setSavedUsername] = useState('');
  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user?.roblox_username) setSavedUsername(user.roblox_username);
  }, [user]);

  const loadData = useCallback(async (username) => {
    setLoading(true);
    try {
      const [mods, apps, notes] = await Promise.all([
        base44.entities.Moderation.filter({ roblox_username: username }, { sort: '-moderation_date', limit: 50 }),
        base44.entities.Appeal.filter({ roblox_username: username }, { sort: '-created_date', limit: 50 }),
        base44.entities.Notification.filter({ roblox_username: username }, { sort: '-created_date', limit: 20 }),
      ]);
      setModerations(mods?.items || []);
      setAppeals((apps?.items || []).filter((a) => !a.removed));
      setNotifications(notes?.items || []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!savedUsername) return;
    try {
      await base44.entities.Notification.updateMany(
        { roblox_username: savedUsername, read: false },
        { $set: { read: true } }
      );
      const notes = await base44.entities.Notification.filter({ roblox_username: savedUsername }, { sort: '-created_date', limit: 20 });
      setNotifications(notes?.items || []);
    } catch {}
  }, [savedUsername]);

  useEffect(() => {
    if (savedUsername) loadData(savedUsername);
    else setLoading(false);
  }, [savedUsername, loadData]);

  const handleVerified = useCallback(async (username) => {
    setSavedUsername(username);
    if (user) {
      try { await base44.auth.updateMe({ roblox_username: username }); } catch {}
    }
  }, [user]);

  const submitAppeal = useCallback(async ({ appeal_reason, why_accepted, deserved_infraction }, activeModeration) => {
    const created = await base44.entities.Appeal.create({
      moderation_id: activeModeration.id,
      roblox_username: savedUsername,
      appeal_reason,
      why_accepted,
      deserved_infraction,
      status: 'Pending',
    });
    if (user?.email) {
      emailPlayer({
        email: user.email,
        subject: 'Your appeal has been submitted',
        body: `Hi ${savedUsername},\n\nYour appeal for "${activeModeration?.moderation_type || 'your moderation'}" has been received. Our staff team will review it shortly.\n\nYou can track the status in the Member Portal.\n\n— Escape Tsunami Staff Team`,
      });
    }
    await loadData(savedUsername);
    return created;
  }, [savedUsername, user, loadData]);

  const refresh = useCallback(() => { if (savedUsername) loadData(savedUsername); }, [savedUsername, loadData]);

  // Single source of truth for appeals lock
  const appealsLocked = !!(user?.data?.appeals_locked || user?.appeals_locked || appeals.some((a) => a.admin_locked));

  const activeCount = moderations.filter((m) => m.status === 'Active').length;
  const lastModDate = moderations.map((m) => m.moderation_date).filter(Boolean).sort().pop();
  const daysSinceLast = lastModDate
    ? Math.floor((Date.now() - new Date(lastModDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const pendingAppeals = appeals.filter((a) => a.status === 'Pending' || a.status === 'Under Review');
  const unreadNotifications = notifications.filter((n) => !n.read);
  const appealableModerations = moderations.filter((m) => {
    const appeal = appeals.find((a) => a.moderation_id === m.id);
    if (!appeal) return m.status === 'Active';
    if (appeal.status === 'Denied') return appeal.can_reappeal !== false;
    return false;
  });

  return {
    user,
    savedUsername,
    moderations,
    appeals,
    notifications,
    loading,
    lastUpdated,
    appealsLocked,
    activeCount,
    daysSinceLast,
    pendingAppeals,
    unreadNotifications,
    appealableModerations,
    loadData,
    markAllRead,
    handleVerified,
    submitAppeal,
    refresh,
  };
}