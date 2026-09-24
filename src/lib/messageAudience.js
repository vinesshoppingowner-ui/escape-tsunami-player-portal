import { base44 } from '@/api/base44Client';

export const AUDIENCES = [
  { value: 'single', label: 'One player' },
  { value: 'active_bans', label: 'All actively banned players' },
  { value: 'active_mods', label: 'All players with an active moderation' },
  { value: 'watchlist', label: 'All watchlisted players' },
  { value: 'all_verified', label: 'All verified players' },
];

// Returns a unique list of Roblox usernames for the chosen audience.
export async function resolveAudience(audience, single) {
  let names = [];
  if (audience === 'single') names = [single.trim()];
  if (audience === 'active_bans' || audience === 'active_mods') {
    const mods = await base44.entities.Moderation.filter({ status: 'Active' }, '-moderation_date', 1000);
    names = (mods || []).filter((m) => audience === 'active_mods' || m.moderation_type?.includes('Ban')).map((m) => m.roblox_username);
  }
  if (audience === 'watchlist') names = ((await base44.entities.WatchlistEntry.list('-created_date', 1000)) || []).map((w) => w.roblox_username);
  if (audience === 'all_verified') names = ((await base44.entities.User.list()) || []).map((u) => u.roblox_username);
  return [...new Set(names.filter(Boolean))];
}