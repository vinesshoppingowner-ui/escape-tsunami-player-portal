import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const RENDER_SERVER_URL = 'https://escape-tsunami-bans.onrender.com';
const UNIT_MS = { m: 60e3, h: 36e5, d: 864e5, w: 6048e5 };

function durationMs(duration) {
  const match = /^(\d+)\s*([mhdw])/i.exec(duration || '');
  return match ? Number(match[1]) * UNIT_MS[match[2].toLowerCase()] : null;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const bans = await db.Moderation.filter({ moderation_type: 'Temporary Ban', status: 'Active' }, '-moderation_date', 500);
    const now = Date.now();
    const expired = [];

    for (const m of bans) {
      const ms = durationMs(m.duration);
      if (!ms || !m.moderation_date) continue;
      if (new Date(m.moderation_date).getTime() + ms > now) continue;

      await db.Moderation.update(m.id, { status: 'Expired' });
      let unbanned = false;
      try {
        const res = await fetch(`${RENDER_SERVER_URL}/api/unban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: m.roblox_username }),
        });
        unbanned = res.ok;
      } catch (_e) { /* game server offline */ }

      await db.StaffLog.create({
        staff_username: 'Auto-expiry',
        action: 'moderation_edited',
        target: m.roblox_username,
        detail: `Temporary Ban (${m.duration}) expired automatically${unbanned ? '' : ' — in-game unban failed'}`,
      });
      await db.Notification.create({
        roblox_username: m.roblox_username,
        title: 'Your temporary ban has expired',
        body: `Your ${m.duration} ban for "${m.reason}" has ended. Welcome back!`,
        type: 'moderation_expired',
        read: false,
      });
      expired.push(m.roblox_username);
    }

    return Response.json({ checked: bans.length, expired });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}