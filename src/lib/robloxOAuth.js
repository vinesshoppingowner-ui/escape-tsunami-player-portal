import { base44 } from '@/api/base44Client';

export const ROBLOX_STATE_KEY = 'roblox_oauth_state';

export async function startRobloxLogin() {
  const state = crypto.randomUUID();
  sessionStorage.setItem(ROBLOX_STATE_KEY, state);
  const res = await base44.functions.invoke('robloxOAuth', { action: 'start', state });
  window.location.href = res.data.url;
}