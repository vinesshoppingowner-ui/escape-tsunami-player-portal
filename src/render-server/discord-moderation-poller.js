/* eslint-disable no-undef */
/**
 * Discord Moderation Poller — Escape Tsunami Portal
 *
 * Connects your Discord bot to the website so staff can remotely
 * moderate Discord users (timeout, kick, ban, etc.) from the admin dashboard.
 *
 * The bot polls the website's API for pending actions, executes them in Discord,
 * and reports the result back.
 *
 * ========== SETUP ==========
 *
 * 1. Go to the "API" page in your app dashboard on Base44.
 * 2. Generate a personal access token and note your App ID.
 * 3. Add these to your bot's .env file:
 *
 *    PORTAL_APP_ID=your_app_id_here
 *    PORTAL_API_KEY=your_personal_access_token_here
 *    DISCORD_GUILD_ID=your_discord_server_id_here
 *
 * 4. Copy this file into your bot project (next to index.js).
 * 5. In your bot's index.js, after client.login(process.env.BOT_TOKEN), add:
 *
 *    const { startModerationPoller } = require('./discord-moderation-poller');
 *    startModerationPoller(client);
 *
 * That's it! The bot will poll every 10 seconds for pending actions.
 *
 * ========== HOW IT WORKS ==========
 *
 * - Staff queues a Discord action from the admin dashboard (Discord tab)
 * - The action is saved as a "pending" DiscordAction record on the website
 * - This poller fetches pending actions every 10 seconds
 * - For each action, the bot executes it in Discord (timeout/kick/ban/etc.)
 * - The action is updated to "completed" or "failed" with a result message
 * - The dashboard auto-refreshes to show the result
 */

const API_BASE = process.env.PORTAL_API_URL || 'https://base44.app/api/apps';
const POLL_INTERVAL = 10000; // 10 seconds

let isPolling = false;

/**
 * Fetches all pending Discord actions from the website.
 */
async function getPendingActions(appId, apiKey) {
  const url = `${API_BASE}/${appId}/entities/DiscordAction`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}\n  URL: ${url}\n  AppId: ${appId}`);
  const data = await res.json();
  // Handle both array or paginated object responses
  const items = Array.isArray(data) ? data : (data.items || data.data || []);
  return items.filter((a) => a.status === 'pending');
}

/**
 * Updates a Discord action's status and result on the website.
 */
async function updateAction(appId, apiKey, id, updates) {
  const url = `${API_BASE}/${appId}/entities/DiscordAction/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Executes a single Discord action using the discord.js client.
 */
async function executeAction(client, guildId, action) {
  const guild = await client.guilds.fetch(guildId);

  switch (action.action_type) {
    case 'timeout': {
      const member = await guild.members.fetch(action.discord_user_id);
      const minutes = action.duration_minutes || 5;
      await member.timeout(minutes * 60 * 1000, action.reason || 'No reason provided');
      return `Timed out for ${minutes} minute(s)`;
    }
    case 'untimeout': {
      const member = await guild.members.fetch(action.discord_user_id);
      await member.timeout(null, action.reason || 'Timeout removed');
      return 'Timeout removed';
    }
    case 'kick': {
      const member = await guild.members.fetch(action.discord_user_id);
      await member.kick(action.reason || 'No reason provided');
      return 'Kicked from server';
    }
    case 'ban': {
      await guild.bans.create(action.discord_user_id, {
        reason: action.reason || 'No reason provided',
      });
      return 'Banned from server';
    }
    case 'unban': {
      await guild.bans.remove(action.discord_user_id, action.reason || 'Unbanned');
      return 'Unbanned';
    }
    default:
      throw new Error(`Unknown action type: ${action.action_type}`);
  }
}

/**
 * One poll cycle: fetch pending actions, execute each, update results.
 */
async function pollAndExecute(client) {
  if (isPolling) return;
  isPolling = true;

  const appId = process.env.PORTAL_APP_ID;
  const apiKey = process.env.PORTAL_API_KEY;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!appId || !apiKey || !guildId) {
    console.error('[PortalPoller] Missing env vars. Set PORTAL_APP_ID, PORTAL_API_KEY, DISCORD_GUILD_ID in .env');
    isPolling = false;
    return;
  }

  try {
    const actions = await getPendingActions(appId, apiKey);
    if (actions.length > 0) {
      console.log(`[PortalPoller] Found ${actions.length} pending Discord action(s)`);
    }

    for (const action of actions) {
      const target = action.discord_username || action.discord_user_id;
      console.log(`[PortalPoller] Executing ${action.action_type} on ${target}…`);
      try {
        const result = await executeAction(client, guildId, action);
        await updateAction(appId, apiKey, action.id, {
          status: 'completed',
          result_message: result,
          executed_at: new Date().toISOString(),
        });
        console.log(`[PortalPoller] ✓ ${result} — ${target}`);
      } catch (err) {
        await updateAction(appId, apiKey, action.id, {
          status: 'failed',
          result_message: err.message,
          executed_at: new Date().toISOString(),
        });
        console.error(`[PortalPoller] ✗ Failed: ${err.message} — ${target}`);
      }
    }
  } catch (err) {
    console.error('[PortalPoller] Poll error:', err.message);
  } finally {
    isPolling = false;
  }
}

/**
 * Call this after your bot logs in to start polling.
 * @param {import('discord.js').Client} client - Your discord.js client
 */
function startModerationPoller(client) {
  const appId = process.env.PORTAL_APP_ID;
  const apiKey = process.env.PORTAL_API_KEY;
  const guildId = process.env.DISCORD_GUILD_ID;
  console.log('[PortalPoller] Started — polling for pending Discord actions every 10s');
  console.log('[PortalPoller] Config:');
  console.log('  API_BASE:', API_BASE);
  console.log('  PORTAL_APP_ID:', appId ? `${appId.slice(0, 8)}…` : '(missing!)');
  console.log('  PORTAL_API_KEY:', apiKey ? `${apiKey.slice(0, 6)}…` : '(missing!)');
  console.log('  DISCORD_GUILD_ID:', guildId ? `${guildId.slice(0, 6)}…` : '(missing!)');
  console.log('  Poll URL:', `${API_BASE}/${appId}/entities/DiscordAction`);
  pollAndExecute(client).catch(() => {});
  setInterval(() => pollAndExecute(client).catch(() => {}), POLL_INTERVAL);
}

/**
 * Sends moderation DM info to the website so it can issue a web notification.
 *
 * Call this from your bot's sendModerationDM() function — right after (or
 * alongside) the Discord DM send — so the website can show an in-portal
 * notification, email, or website-based message about the action.
 *
 * @param {object} params
 * @param {string} params.discord_user_id   - The target user's Discord ID
 * @param {string} [params.discord_username] - The target user's Discord username
 * @param {string} params.action_type        - timeout, kick, ban, unban, etc.
 * @param {string} params.reason             - Reason shown to the user
 * @param {number} [params.duration_minutes] - Timeout duration (if applicable)
 * @param {string} [params.guild_id]         - The Discord guild ID
 * @param {string} [params.issued_by]        - Staff member who issued it
 * @returns {Promise<object>} The created notification record
 */
async function sendWebsiteNotification(params) {
  const appId = process.env.PORTAL_APP_ID;
  const apiKey = process.env.PORTAL_API_KEY;
  if (!appId || !apiKey) {
    console.warn('[PortalPoller] Cannot send website notification — missing PORTAL_APP_ID or PORTAL_API_KEY');
    return null;
  }

  const { discord_user_id, discord_username, action_type, reason, duration_minutes, guild_id, issued_by } = params;
  const displayUser = discord_username || discord_user_id || 'Unknown user';
  const durationText = action_type === 'timeout' && duration_minutes ? ` for ${duration_minutes} minute(s)` : '';

  const url = `${API_BASE}/${appId}/entities/Notification`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      roblox_username: displayUser,
      title: `Discord ${action_type} issued`,
      body: reason || `A Discord ${action_type} has been issued against your account${durationText}.`,
      type: 'moderation_issued',
      read: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[PortalPoller] Website notification failed: API ${res.status}: ${body}`);
    return null;
  }

  const data = await res.json();
  console.log(`[PortalPoller] Website notification sent for ${displayUser}`);
  return data;
}

module.exports = { startModerationPoller, sendWebsiteNotification };