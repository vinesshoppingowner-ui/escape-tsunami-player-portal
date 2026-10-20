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

// Search for a portal account by Portal Account ID.
export async function findUserByAccountId(accountId) {
  if (!accountId) return null;
  const clean = String(accountId).trim();
  if (!clean) return null;

  try {
    const direct = await base44.entities.User.get(clean);
    if (direct && direct.id) return direct;
  } catch {}

  try {
    const users = await base44.entities.User.filter({ id: clean }, '-created_date', 5);
    if (users?.length > 0) return users[0];
  } catch {}

  try {
    const allUsers = await base44.entities.User.list('-created_date', 1000);
    const lower = clean.toLowerCase();
    return allUsers.find((u) => String(u.id || '').toLowerCase() === lower) || null;
  } catch {}

  return null;
}

// Search for a portal account by Portal Account ID, email, or Roblox username.
export async function findUserByEmailOrUsername(query) {
  if (!query) return null;
  const q = String(query).trim();
  if (!q) return null;

  // Check if query looks like a 24-char hex ObjectId or UUID Account ID
  const looksLikeAccountId = /^[0-9a-fA-F]{20,36}$/.test(q) || /^[0-9a-fA-F-]{32,36}$/.test(q);
  if (looksLikeAccountId) {
    const byId = await findUserByAccountId(q);
    if (byId) return byId;
  }

  const isEmail = q.includes('@');
  if (isEmail) {
    try {
      const users = await base44.entities.User.filter({ email: q }, '-created_date', 5);
      if (users.length > 0) return users[0];
    } catch {}
    try {
      const allUsers = await base44.entities.User.list('-created_date', 1000);
      const lower = q.toLowerCase();
      return allUsers.find((u) => u.email?.toLowerCase() === lower) || null;
    } catch {}
    return null;
  }

  const byUsername = await findUserByRobloxUsername(q);
  if (byUsername) return byUsername;

  // Fallback: check if any user ID matches exact query
  return findUserByAccountId(q);
}