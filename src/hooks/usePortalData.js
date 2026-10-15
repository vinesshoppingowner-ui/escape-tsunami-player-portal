import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { emailPlayer } from '@/lib/userEmails';

export function usePortalData() {
  const { user, isLoadingAuth } = useAuth();
  const [savedUsername, setSavedUsername] = useState('');
  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [modCursor, setModCursor] = useState(null);
  const [appealCursor, setAppealCursor] = useState(null);
  const [hasMoreMods, setHasMoreMods] = useState(false);
  const [hasMoreAppeals, setHasMoreAppeals] = useState(false);

  useEffect(() => {
    if (user?.roblox_username) setSavedUsername(user.roblox_username);
  }, [user]);

  const loadData = useCallback(async (username, silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [mods, apps, notes] = await Promise.all([
        base44.entities.Moderation.filter({ roblox_username: username }, { sort: '-moderation_date', limit: 50 }),
        base44.entities.Appeal.filter({ roblox_username: username }, { sort: '-created_date', limit: 50 }),
        base44.entities.Notification.filter({ roblox_username: username }, { sort: '-created_date', limit: 20 }),
      ]);
      setModerations(mods?.items || []);
      setAppeals((apps?.items || []).filter((a) => !a.removed));
      setNotifications(notes?.items || []);
      setModCursor(mods?.next_cursor || null);
      setAppealCursor(apps?.next_cursor || null);
      setHasMoreMods(!!mods?.has_more);
      setHasMoreAppeals(!!apps?.has_more);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || 'Failed to load your portal data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (savedUsername) loadData(savedUsername);
    else if (!isLoadingAuth) setLoading(false);
  }, [savedUsername, isLoadingAuth, loadData]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!savedUsername) return;
    const interval = setInterval(() => loadData(savedUsername, true), 60000);
    return () => clearInterval(interval);
  }, [savedUsername, loadData]);

  // Refresh on window focus
  useEffect(() => {
    const onFocus = () => { if (savedUsername) loadData(savedUsername, true); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [savedUsername, loadData]);

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
        body: `Hi ${savedUsername},\n\nYour appeal for "${activeModeration?.moderation_type || 'your moderation'}" has been received. Our staff team will review it shortly.\n\nYou can track the status in the Member Portal.\n\n— Escape Tsunami for Developers Staff Team`,
      });
    }
    await loadData(savedUsername, true);
    return created;
  }, [savedUsername, user, loadData]);

  const refresh = useCallback(() => { if (savedUsername) loadData(savedUsername, true); }, [savedUsername, loadData]);
  const retry = useCallback(() => { if (savedUsername) loadData(savedUsername); }, [savedUsername, loadData]);

  const loadMoreModerations = useCallback(async () => {
    if (!savedUsername || !modCursor) return;
    try {
      const page = await base44.entities.Moderation.filter(
        { roblox_username: savedUsername },
        { sort: '-moderation_date', limit: 50, cursor: modCursor }
      );
      setModerations((prev) => [...prev, ...(page?.items || [])]);
      setModCursor(page?.next_cursor || null);
      setHasMoreMods(!!page?.has_more);
    } catch {}
  }, [savedUsername, modCursor]);

  const loadMoreAppeals = useCallback(async () => {
    if (!savedUsername || !appealCursor) return;
    try {
      const page = await base44.entities.Appeal.filter(
        { roblox_username: savedUsername },
        { sort: '-created_date', limit: 50, cursor: appealCursor }
      );
      setAppeals((prev) => [...prev, ...(page?.items || []).filter((a) => !a.removed)]);
      setAppealCursor(page?.next_cursor || null);
      setHasMoreAppeals(!!page?.has_more);
    } catch {}
  }, [savedUsername, appealCursor]);

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
    isLoadingAuth,
    savedUsername,
    moderations,
    appeals,
    notifications,
    loading,
    refreshing,
    error,
    lastUpdated,
    appealsLocked,
    activeCount,
    daysSinceLast,
    pendingAppeals,
    unreadNotifications,
    appealableModerations,
    hasMoreMods,
    hasMoreAppeals,
    loadData,
    markAllRead,
    handleVerified,
    submitAppeal,
    refresh,
    retry,
    loadMoreModerations,
    loadMoreAppeals,
  };
}