import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { discord_id } = body;

    if (!discord_id) return Response.json({ error: 'discord_id required' }, { status: 400 });

    const botToken = secrets.get('DISCORD_BOT_TOKEN');
    const guildId = secrets.get('DISCORD_GUILD_ID');
    const roleId = secrets.get('DISCORD_DEVOTED_ROLE_ID');

    if (!botToken || !guildId || !roleId) {
      return Response.json({ error: 'Discord secrets not configured' }, { status: 500 });
    }

    const res = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${discord_id}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bot ${botToken}` },
      }
    );

    if (!res.ok && res.status !== 204) {
      const errText = await res.text();
      return Response.json({ error: `Discord API error: ${errText}` }, { status: res.status });
    }

    return Response.json({ success: true, message: 'Devoted role assigned' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}