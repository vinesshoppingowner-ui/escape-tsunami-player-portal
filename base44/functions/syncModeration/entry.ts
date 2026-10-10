import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { waitUntil } from 'base44:runtime';

// Called by the Roblox game server (not a logged-in user) to push moderation
// records into the portal's Moderation entity. Auth is the shared game API key
// — same as checkPlayerBan, getPlayerWarnings, and submit-game-logs.
//
// Also creates a Notification for the moderated player so they see it in the
// portal on their next visit.

export default async function (req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { moderations } = body;

    if (!Array.isArray(moderations) || moderations.length === 0) {
      return Response.json({ error: 'moderations array is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const records = await base44.asServiceRole.entities.Moderation.bulkCreate(
      moderations.map((m: any) => ({
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

    // Fire off notifications in the background (one per moderated player)
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