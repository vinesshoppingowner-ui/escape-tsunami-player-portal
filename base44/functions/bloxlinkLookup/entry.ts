import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const staff = user.role === 'admin' || user.role === 'staff' || user.is_owner || user.data?.is_owner;
    if (!staff) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { mode, query } = await req.json();
    const q = String(query || '').trim();
    if (!q) return Response.json({ error: 'Enter a username or ID' }, { status: 400 });

    const guild = secrets.get('DISCORD_GUILD_ID');
    const bloxHeaders = { Authorization: secrets.get('BLOXLINK_API_KEY') };
    const base = `https://api.blox.link/v4/public/guilds/${guild}`;

    let robloxId, discordIds = [];
    if (mode === 'discord') {
      const discordId = q.replace(/[^0-9]/g, '');
      const r = await fetch(`${base}/discord-to-roblox/${discordId}`, { headers: bloxHeaders });
      const d = await r.json();
      if (!r.ok || !d.robloxID) return Response.json({ error: d.error || 'This Discord user is not verified with Bloxlink in your server.' }, { status: 404 });
      robloxId = d.robloxID;
      discordIds = [discordId];
    } else {
      const ur = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [q], excludeBannedUsers: false }),
      });
      robloxId = (await ur.json()).data?.[0]?.id;
      if (!robloxId) return Response.json({ error: `No Roblox user named "${q}"` }, { status: 404 });
      const r = await fetch(`${base}/roblox-to-discord/${robloxId}`, { headers: bloxHeaders });
      const d = await r.json();
      discordIds = d.discordIDs || [];
      if (!r.ok || !discordIds.length) return Response.json({ error: d.error || 'This Roblox user has no Bloxlink-linked Discord in your server.' }, { status: 404 });
    }

    const roblox = await (await fetch(`https://users.roblox.com/v1/users/${robloxId}`)).json();
    const botHeaders = { Authorization: `Bot ${secrets.get('DISCORD_BOT_TOKEN')}` };
    const discord = await Promise.all(discordIds.map(async (id) => {
      const r = await fetch(`https://discord.com/api/v10/guilds/${guild}/members/${id}`, { headers: botHeaders });
      if (!r.ok) return { id, inServer: false };
      const m = await r.json();
      const u = m.user;
      return {
        id, inServer: true,
        username: u.username,
        displayName: m.nick || u.global_name || u.username,
        avatar: u.avatar ? `https://cdn.discordapp.com/avatars/${id}/${u.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(id) % 6n)}.png`,
        joinedAt: m.joined_at,
      };
    }));

    return Response.json({
      roblox: { id: robloxId, username: roblox.name, displayName: roblox.displayName },
      discord,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}