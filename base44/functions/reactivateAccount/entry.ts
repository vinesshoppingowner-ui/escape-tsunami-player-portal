import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Lifts a website ban for the caller only if a staff member accepted their website-ban appeal.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const username = user.data?.roblox_username || user.roblox_username;
    if (!username) return Response.json({ error: 'No Roblox account linked' }, { status: 400 });

    const sr = base44.asServiceRole;

    // Read the authoritative User record so we only ever use the IP recorded on the user account, never request input.
    const freshUser = await sr.entities.User.get(user.id).catch(() => user);
    const recordedIp = freshUser?.data?.last_ip || freshUser?.last_ip || user.data?.last_ip || user.last_ip || null;
    const bannedAtRaw = freshUser?.data?.banned_at || freshUser?.banned_at || user.data?.banned_at || user.banned_at;

    let banStart = bannedAtRaw ? new Date(bannedAtRaw).getTime() : 0;
    if (recordedIp) {
      const bans = await sr.entities.IpBan.filter({ ip_address: recordedIp }, { sort: '-created_date', limit: 1 });
      const d = (bans.items || bans)[0]?.created_date;
      if (d) banStart = Math.max(banStart, new Date(d).getTime());
    }

    const page = await sr.entities.Appeal.filter(
      { roblox_username: username, moderation_id: 'unlisted', status: 'Approved' },
      { sort: '-created_date', limit: 20 },
    );
    const items = page.items || page || [];

    // Only accept an appeal that was explicitly decided by a staff member (decided_by set by staff) after the ban started.
    const ok = items.some((a: any) => {
      const hasStaffDecider = typeof a.decided_by === 'string' && a.decided_by.trim().length > 0;
      const isWebsiteBan = /website/i.test(a.unlisted_type || '');
      const decidedTime = new Date(a.decided_at || a.updated_date).getTime();
      return hasStaffDecider && isWebsiteBan && decidedTime > banStart;
    });

    if (!ok) return Response.json({ error: 'No staff-approved appeal found' }, { status: 403 });

    await sr.entities.User.update(user.id, { banned: false, banned_reason: null, banned_until: null });
    if (recordedIp) {
      await sr.entities.IpBan.deleteMany({ ip_address: recordedIp });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}