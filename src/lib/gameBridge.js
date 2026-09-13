// Bridge between the Base44 admin dashboard and the Roblox game via the Render server.
// The Render server receives moderation commands here and relays them to all
// Roblox game servers via Roblox Open Cloud MessagingService API.

const ROXY_SEARCH = 'https://users.roproxy.com/v1/users/search';
const RENDER_MODERATE_URL = 'https://etfd.onrender.com/api/roblox/moderate';
const SERVER_SECRET = 'ETFD23';

/**
 * Resolve a Roblox username to a numeric user ID via RoProxy.
 * Uses the GET search endpoint (same one RobloxAvatar uses) to avoid CORS
 * preflight issues that the POST usernames endpoint triggers in browsers.
 */
export async function resolveUserId(username) {
  if (!username) return null;
  try {
    const res = await fetch(`${ROXY_SEARCH}?keyword=${encodeURIComponent(username)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const match = (data?.data || []).find(
      (u) => (u.name || '').toLowerCase() === username.toLowerCase()
        || (u.displayName || '').toLowerCase() === username.toLowerCase()
    );
    return match?.id || null;
  } catch {
    return null;
  }
}

/**
 * Parse a duration string like "24h", "7d", "30m", "Permanent" into seconds.
 * Returns 0 for permanent / unparseable.
 */
export function parseDurationToSeconds(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  const s = durationStr.trim().toLowerCase();
  if (s === 'permanent' || s === 'perm' || s === '∞' || s === '') return 0;
  const match = s.match(/^(\d+)\s*(s|m|h|d|w)$/);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return num * (multipliers[match[2]] || 0);
}

/**
 * Map the portal moderation type to the in-game action code.
 */
export function moderationTypeToAction(type) {
  const map = {
    Warning: 'WARN',
    Mute: 'MUTE',
    Kick: 'KICK',
    'Temporary Ban': 'BAN',
    'Permanent Ban': 'BAN',
  };
  return map[type] || 'WARN';
}

/**
 * Send a moderation command to the Render server, which relays it to all
 * Roblox game servers via Roblox Open Cloud MessagingService API.
 *
 * @param {object} opts
 * @param {string} opts.username  Roblox username
 * @param {string} opts.type      Portal moderation type (Warning, Mute, Kick, etc.)
 * @param {string} opts.reason    Reason text
 * @param {string} opts.duration  Duration string like "24h", "7d", "Permanent"
 * @param {string} opts.admin     Staff member name
 * @returns {Promise<{ok: boolean, userId?: number, error?: string}>}
 */
export async function sendModerationToGame({ username, type, reason, duration, admin }) {
  const userId = await resolveUserId(username);
  if (!userId) return { ok: false, error: 'Could not resolve Roblox user ID' };

  const action = moderationTypeToAction(type);
  const durationSeconds = type === 'Permanent Ban' ? 0 : parseDurationToSeconds(duration);

  try {
    const res = await fetch(RENDER_MODERATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-server-secret': SERVER_SECRET,
      },
      body: JSON.stringify({
        action,
        userId,
        username,
        reason: reason || 'No reason provided',
        durationSeconds,
        admin: admin || 'Staff Admin',
        caseId: '#CASE-' + Math.floor(10000 + Math.random() * 89999),
      }),
    });
    if (!res.ok) return { ok: false, userId, error: `Render server returned ${res.status} ${res.statusText}` };
    return { ok: true, userId };
  } catch (e) {
    return { ok: false, error: `Cannot reach Render server (${e.message || 'network error'})` };
  }
}

/**
 * Send an unban command to the Render server for the given username.
 */
export async function sendUnbanToGame(username) {
  const userId = await resolveUserId(username);
  if (!userId) return { ok: false, error: 'Could not resolve Roblox user ID' };

  try {
    const res = await fetch(RENDER_MODERATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-server-secret': SERVER_SECRET,
      },
      body: JSON.stringify({
        action: 'UNBAN',
        userId,
        username,
      }),
    });
    if (!res.ok) return { ok: false, userId, error: `Render server returned ${res.status} ${res.statusText}` };
    return { ok: true, userId };
  } catch (e) {
    return { ok: false, error: `Cannot reach Render server (${e.message || 'network error'})` };
  }
}