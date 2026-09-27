import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && !user.is_owner && !user.data?.is_owner) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const headers = { Authorization: `Bot ${secrets.get('DISCORD_BOT_TOKEN')}`, 'Content-Type': 'application/json' };
    const { action, channel_id, content, embed, updates } = await req.json();
    const guild = secrets.get('DISCORD_GUILD_ID');

    if (action === 'roles') {
      const r = await fetch(`https://discord.com/api/v10/guilds/${guild}/roles`, { headers });
      const d = await r.json();
      if (!r.ok) return Response.json({ error: d.message || 'Could not load roles' }, { status: r.status });
      return Response.json({ roles: d.sort((a, b) => b.position - a.position) });
    }

    if (action === 'deleteRole') {
      const r = await fetch(`https://discord.com/api/v10/guilds/${guild}/roles/${channel_id}`, { method: 'DELETE', headers });
      if (!r.ok) { const d = await r.json(); return Response.json({ error: d.message || 'Delete failed' }, { status: r.status }); }
      return Response.json({ ok: true });
    }

    if (action === 'updateRoles') {
      const results = [];
      for (const u of updates || []) {
        const { id, ...patch } = u;
        const r = await fetch(`https://discord.com/api/v10/guilds/${guild}/roles/${id}`, { method: 'PATCH', headers, body: JSON.stringify(patch) });
        const d = await r.json();
        results.push({ id, ok: r.ok, error: r.ok ? null : d.message });
      }
      return Response.json({ results });
    }

    if (action === 'channels') {
      const r = await fetch(`https://discord.com/api/v10/guilds/${secrets.get('DISCORD_GUILD_ID')}/channels`, { headers });
      const d = await r.json();
      if (!r.ok) return Response.json({ error: d.message || 'Could not load channels' }, { status: r.status });
      const channels = d.filter((c) => c.type === 0 || c.type === 5).sort((a, b) => a.position - b.position).map((c) => ({ id: c.id, name: c.name }));
      return Response.json({ channels });
    }

    const body = { content: content || undefined, embeds: embed ? [embed] : undefined };
    if (!body.content && !body.embeds) return Response.json({ error: 'Message is empty' }, { status: 400 });
    const r = await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages`, { method: 'POST', headers, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) return Response.json({ error: d.message || 'Send failed' }, { status: r.status });
    return Response.json({ ok: true, id: d.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}