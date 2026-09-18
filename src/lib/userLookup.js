import { base44 } from '@/api/base44Client';

// Case-insensitive Roblox username → portal User account lookup.
// Tries exact match first, then falls back to scanning all users.
export async function findUserByRobloxUsername(username) {
  if (!username) return null;

  // 1. Exact match (fast path)
  try {
    const users = await base44.entities.User.filter(
      { roblox_username: username },
      '-created_date',
      5
    );
    if (users.length > 0) return users[0];
  } catch {}

  // 2. Case-insensitive fallback (the user may have registered with different casing)
  try {
    const allUsers = await base44.entities.User.list('-created_date', 500);
    return (
      allUsers.find(
        (u) =>
          (u.data?.roblox_username || '').toLowerCase() ===
          username.toLowerCase()
      ) || null
    );
  } catch {}

  return null;
}