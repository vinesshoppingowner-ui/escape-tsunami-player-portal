import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const EVT = 'et-prefs-change';
export const WELCOME_FLAG = 'et_welcome';

export const DEFAULT_PREFS = {
  accent: 'cyan',
  appeal_card_style: 'standard',
  welcome_popup: true,
  seasonal_effects: true,
  glass_transparency: 50,
  font_size: 'normal',
  compact_mode: false,
  reduce_motion: false,
  notify_appeals: true,
  notify_moderations: true,
  notify_staff_messages: true,
  notification_sound: true,
  hide_online_status: false,
};

const NOTIF_PREF = {
  appeal_decision: 'notify_appeals',
  moderation_issued: 'notify_moderations',
  moderation_expired: 'notify_moderations',
  staff_message: 'notify_staff_messages',
};

// Whether a notification of this type should be shown under the user's settings
export const notifAllowed = (prefs, type) => prefs[NOTIF_PREF[type]] !== false;

export function playNotifSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = 880;
  g.gain.setValueAtTime(0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.35);
}

const localKey = (user) => `et_prefs_${user?.id || 'guest'}`;
const readLocal = (user) => {
  try { return JSON.parse(localStorage.getItem(localKey(user))) || {}; } catch { return {}; }
};

export function getPrefs(user) {
  return { ...DEFAULT_PREFS, ...(user?.prefs || {}), ...readLocal(user) };
}

export async function savePrefs(user, patch) {
  const next = { ...getPrefs(user), ...patch };
  localStorage.setItem(localKey(user), JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
  if (user) await base44.auth.updateMe({ prefs: next });
  return next;
}

export function useUserPrefs() {
  const { user } = useAuth();
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return getPrefs(user);
}

export const markJustLoggedIn = () => sessionStorage.setItem(WELCOME_FLAG, '1');