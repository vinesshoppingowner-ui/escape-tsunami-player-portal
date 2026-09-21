import { base44 } from '@/api/base44Client';

// Replace with your Render server URL after deploying
const RENDER_SERVER_URL = "https://escape-tsunami-bans.onrender.com";

export async function pushBan(moderation) {
  const res = await fetch(`${RENDER_SERVER_URL}/api/ban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: moderation.roblox_username,
      type: moderation.moderation_type,
      reason: moderation.reason,
      duration: moderation.duration || "Permanent",
      staff: moderation.staff_member || "Staff Team",
      details: moderation.details || "",
    }),
  });
  if (!res.ok) throw new Error(`Ban push failed: ${res.status}`);
  return res.json();
}

export async function pushUnban(username) {
  const res = await fetch(`${RENDER_SERVER_URL}/api/unban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(`Unban push failed: ${res.status}`);
  return res.json();
}

export async function syncAllBans(moderations) {
  const bans = moderations.filter(
    (m) =>
      (m.moderation_type === "Permanent Ban" || m.moderation_type === "Temporary Ban") &&
      m.status === "Active"
  );
  const res = await fetch(`${RENDER_SERVER_URL}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bans }),
  });
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
  return res.json();
}

export async function fetchChatLogs(username) {
  const logs = await base44.entities.ChatLog.filter(
    { roblox_username: username },
    '-timestamp',
    200
  );
  return (logs || []).map((log) => ({
    time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '',
    msg: log.message,
    timestamp: log.timestamp,
  }));
}

export async function fetchExploitLogs(username) {
  const logs = await base44.entities.ExploitLog.filter(
    { roblox_username: username },
    '-timestamp',
    100
  );
  return (logs || []).map((log) => ({
    exploitType: log.exploit_type,
    details: log.details,
    timestamp: log.timestamp,
  }));
}