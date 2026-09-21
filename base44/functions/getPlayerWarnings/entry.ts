import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

// Called by the Roblox game (not a logged-in user) so the in-game warning GUI
// can show a player their active warnings. Auth is the shared game API key.
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
      { roblox_username: username, moderation_type: 'Warning', status: 'Active' },
      '-moderation_date',
      25
    );

    const warnings = records.map((m) => ({
      id: m.id,
      reason: m.reason,
      details: m.details || '',
      staff_member: m.staff_member || 'Staff',
      date: m.moderation_date || m.created_date,
    }));

    return Response.json({ roblox_username: username, count: warnings.length, warnings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}