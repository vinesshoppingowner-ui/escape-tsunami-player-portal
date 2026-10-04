import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

// Called by the Roblox game server (not a logged-in user) to check if a player
// has an active ban in the portal's Moderation records. Auth is the shared game
// API key — same as getPlayerWarnings and submit-game-logs.
//
// Returns { banned: true, reason, admin, durationSeconds, bannedAt, caseId }
// where durationSeconds is -1 for permanent, or remaining seconds for temp bans.
// Returns { banned: false } when no active ban exists.

function parseDurationToSeconds(durationStr: string | undefined): number {
  if (!durationStr) return -1;
  const lower = durationStr.toLowerCase().trim();
  if (lower === 'permanent' || lower === 'perm' || lower === '') return -1;
  const match = lower.match(/^(\d+)\s*(s|m|h|d|w)$/);
  if (!match) return -1;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return num * multipliers[unit];
}

export default async function (req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const username = (body.roblox_username || '').trim();
    if (!username) {
      return Response.json({ error: 'roblox_username is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const records = await base44.asServiceRole.entities.Moderation.filter(
      {
        roblox_username: username,
        moderation_type: { $in: ['Temporary Ban', 'Permanent Ban'] },
        status: 'Active',
      },
      '-moderation_date',
      5
    );

    if (!records || records.length === 0) {
      return Response.json({ banned: false, roblox_username: username });
    }

    // Most recent active ban (sorted by moderation_date desc)
    const ban = records[0];
    const bannedAt = ban.moderation_date || ban.created_date;
    const isPermanent =
      ban.moderation_type === 'Permanent Ban' ||
      (ban.duration || '').toLowerCase() === 'permanent';

    let durationSeconds = -1;

    if (!isPermanent) {
      const totalDuration = parseDurationToSeconds(ban.duration);
      if (totalDuration > 0 && bannedAt) {
        const bannedTime = new Date(bannedAt).getTime();
        const remainingMs = bannedTime + totalDuration * 1000 - Date.now();
        const remainingSec = Math.ceil(remainingMs / 1000);

        // Ban has expired — don't enforce it (the expire workflow may not have run yet)
        if (remainingSec <= 0) {
          return Response.json({ banned: false, roblox_username: username });
        }
        durationSeconds = remainingSec;
      }
    }

    return Response.json({
      banned: true,
      roblox_username: username,
      reason: ban.reason || 'Banned via Portal',
      admin: ban.staff_member || 'Dashboard Admin',
      durationSeconds,
      bannedAt,
      caseId: ban.id,
      moderation_type: ban.moderation_type,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}