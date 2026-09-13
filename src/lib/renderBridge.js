// Replace with your Render server URL after deploying
const RENDER_SERVER_URL = "https://escape-tsunami-bans.onrender.com";

export async function pushBan(moderation) {
  try {
    await fetch(`${RENDER_SERVER_URL}/api/ban`, {
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
  } catch (e) {
    console.error("Failed to push ban to game server:", e);
  }
}

export async function pushUnban(username) {
  try {
    await fetch(`${RENDER_SERVER_URL}/api/unban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
  } catch (e) {
    console.error("Failed to push unban to game server:", e);
  }
}

export async function syncAllBans(moderations) {
  const bans = moderations.filter(
    (m) =>
      (m.moderation_type === "Permanent Ban" || m.moderation_type === "Temporary Ban") &&
      m.status === "Active"
  );
  try {
    await fetch(`${RENDER_SERVER_URL}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bans }),
    });
  } catch (e) {
    console.error("Failed to sync bans to game server:", e);
  }
}