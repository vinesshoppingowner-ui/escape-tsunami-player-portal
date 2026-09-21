import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const CONNECTOR_ID = '6ab0794c356399d5281b0bdf';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch Discord profile' }, { status: res.status });
    }

    const profile = await res.json();
    return Response.json({
      discord_id: profile.id,
      discord_username: profile.username,
      global_name: profile.global_name || profile.username,
      avatar: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}