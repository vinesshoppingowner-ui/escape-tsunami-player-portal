import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Server-side Roblox profile lookup — calls Roblox directly (no browser CORS / public proxies).
async function getJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Roblox API ${res.status}`);
  return res.json();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = await req.json();
    if (!username) return Response.json({ error: 'username required' }, { status: 400 });

    const found = await getJson('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    });
    const match = found.data?.[0];
    if (!match) return Response.json({ user: null });
    const id = match.id;

    const safe = (p) => p.catch(() => null);
    const [details, head, body, groups] = await Promise.all([
      safe(getJson(`https://users.roblox.com/v1/users/${id}`)),
      safe(getJson(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=420x420&format=Png&isCircular=false`)),
      safe(getJson(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=420x420&format=Png&isCircular=false`)),
      safe(getJson(`https://groups.roblox.com/v1/users/${id}/groups/roles`)),
    ]);

    return Response.json({
      user: { ...match, ...(details || {}) },
      headshot: head?.data?.[0]?.imageUrl || null,
      fullBody: body?.data?.[0]?.imageUrl || null,
      groups: groups?.data || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}