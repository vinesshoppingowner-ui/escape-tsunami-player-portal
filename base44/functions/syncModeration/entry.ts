import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets, waitUntil } from 'base44:runtime';

// Called by the Roblox game server or the Staff Website to pull, push, or update
// moderation records in the portal's Moderation entity.
export default async function (req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    const base44 = createClientFromRequest(req);

    let authorized = Boolean(apiKey && apiKey === secrets.get('GAME_LOG_API_KEY'));
    if (!authorized) {
      const user = await base44.auth.me().catch(() => null);
      if (user && (user.role === 'admin' || user.role === 'staff' || user.data?.is_owner === true)) {
        authorized = true;
      }
    }
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method === 'GET') {
      const page = await base44.asServiceRole.entities.Moderation.filter({}, { sort: '-moderation_date', limit: 250 });
      const items = Array.isArray(page) ? page : page?.items || [];
      return Response.json({ status: 'ok', count: items.length, moderations: items });
    }

    const body = await req.json().catch(() => ({}));

    if (body.action === 'pull') {
      const query = body.roblox_username ? { roblox_username: body.roblox_username } : {};
      const page = await base44.asServiceRole.entities.Moderation.filter(query, { sort: '-moderation_date', limit: 250 });
      const items = Array.isArray(page) ? page : page?.items || [];
      return Response.json({ status: 'ok', count: items.length, moderations: items });
    }

    if (body.action === 'update' && body.id) {
      const patch: Record<string, unknown> = {};
      for (const k of ['moderation_type', 'reason', 'details', 'duration', 'status', 'staff_member', 'evidence_type', 'evidence_text', 'evidence_image_url']) {
        if (body[k] !== undefined) patch[k] = body[k];
      }
      const updated = await base44.asServiceRole.entities.Moderation.update(body.id, patch);
      return Response.json({ status: 'ok', moderation: updated });
    }

    if (body.action === 'delete' && body.id) {
      await base44.asServiceRole.entities.Moderation.delete(body.id);
      return Response.json({ status: 'ok' });
    }

    const rawList = Array.isArray(body.moderations)
      ? body.moderations
      : body.moderation
      ? [body.moderation]
      : body.roblox_username
      ? [body]
      : [];

    if (rawList.length === 0) {
      return Response.json({ error: 'moderations array or moderation object is required' }, { status: 400 });
    }

    const records = await base44.asServiceRole.entities.Moderation.bulkCreate(
      rawList.map((m: any) => ({
        roblox_username: m.roblox_username,
        moderation_type: m.moderation_type || 'Warning',
        reason: m.reason || 'In-game moderation',
        details: m.details || '',
        moderation_date: m.moderation_date || new Date().toISOString(),
        duration: m.duration || '',
        status: m.status || 'Active',
        staff_member: m.staff_member || m.admin || 'In-game Moderator',
        evidence_type: m.evidence_type || 'none',
        evidence_text: m.evidence_text || '',
        evidence_image_url: m.evidence_image_url || '',
        player_notified: true,
      }))
    );

    waitUntil(
      Promise.allSettled(
        (records || []).map((rec: any) =>
          rec?.roblox_username
            ? base44.asServiceRole.entities.Notification.create({
                roblox_username: rec.roblox_username,
                title: `You received a ${rec.moderation_type}`,
                body: rec.reason || 'See your moderation history in the Member Portal for details.',
                type: 'moderation_issued',
                read: false,
              })
            : Promise.resolve()
        )
      )
    );

    return Response.json({
      status: 'ok',
      moderations_created: (records || []).length,
      records: (records || []).map((r: any) => ({ id: r.id, roblox_username: r.roblox_username })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}