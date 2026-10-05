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
  // Check both top-level roblox_username and data.roblox_username since updateMe
  // may store the field in either location depending on the schema.
  try {
    const allUsers = await base44.entities.User.list('-created_date', 1000);
    const lower = username.toLowerCase();
    return (
      allUsers.find(
        (u) => {
          const saved = u.roblox_username || u.data?.roblox_username || '';
          return saved.toLowerCase() === lower;
        }
      ) || null
    );
  } catch {}

  return null;
}

// Search for a portal account by email or Roblox username.
// If the query contains '@', searches by email; otherwise by Roblox username.
export async function findUserByEmailOrUsername(query) {
  if (!query) return null;
  const isEmail = query.includes('@');

  if (isEmail) {
    // Exact email match (fast path)
    try {
      const users = await base44.entities.User.filter({ email: query }, '-created_date', 5);
      if (users.length > 0) return users[0];
    } catch {}
    // Case-insensitive fallback
    try {
      const allUsers = await base44.entities.User.list('-created_date', 1000);
      const lower = query.toLowerCase();
      return allUsers.find((u) => u.email?.toLowerCase() === lower) || null;
    } catch {}
    return null;
  }

  return findUserByRobloxUsername(query);
}