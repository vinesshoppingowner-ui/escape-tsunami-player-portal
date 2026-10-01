import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Lifts a website ban for the caller only if staff accepted their website-ban appeal.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { ip } = await req.json().catch(() => ({}));
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const username = user.data?.roblox_username || user.roblox_username;
    if (!username) return Response.json({ error: 'No Roblox account linked' }, { status: 400 });

    const sr = base44.asServiceRole;
    const page = await sr.entities.Appeal.filter(
      { roblox_username: username, moderation_id: 'unlisted', status: 'Approved' },
      { sort: '-created_date', limit: 20 },
    );
    const items = page.items || page;
    const ok = items.some((a) => /website/i.test(a.unlisted_type || ''));
    if (!ok) return Response.json({ error: 'No accepted appeal found' }, { status: 403 });

    await sr.entities.User.update(user.id, { banned: false, banned_reason: null });
    const ips = [ip, user.data?.last_ip || user.last_ip].filter(Boolean);
    for (const addr of ips) await sr.entities.IpBan.deleteMany({ ip_address: addr });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}