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
};

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