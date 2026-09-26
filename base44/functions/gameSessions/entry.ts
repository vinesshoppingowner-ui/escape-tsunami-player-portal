import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

// Called by the Roblox game when players join / leave.
// Body: { events: [{ type: 'join'|'leave', roblox_username, roblox_user_id, display_name, is_premium, server_name, timestamp }] }
export default async function(req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const Session = base44.asServiceRole.entities.PlayerSession;
    const body = await req.json();
    const events = Array.isArray(body.events) ? body.events : [];
    let joined = 0;
    let left = 0;

    for (const e of events) {
      if (!e.roblox_username) continue;
      const at = e.timestamp || new Date().toISOString();
      const open = await Session.filter({ roblox_username: e.roblox_username, online: true }, '-created_date', 10);

      if (e.type === 'join') {
        // Close any stale open sessions (e.g. server crashed) before starting a new one
        for (const s of open) {
          await Session.update(s.id, { online: false, left_at: at, duration_seconds: Math.max(0, Math.round((new Date(at).getTime() - new Date(s.joined_at).getTime()) / 1000)) });
        }
        await Session.create({
          roblox_username: e.roblox_username,
          roblox_user_id: String(e.roblox_user_id || ''),
          display_name: e.display_name || '',
          is_premium: !!e.is_premium,
          server_name: e.server_name || '',
          joined_at: at,
          online: true,
        });
        joined++;
      } else if (e.type === 'leave') {
        for (const s of open) {
          await Session.update(s.id, { online: false, left_at: at, duration_seconds: Math.max(0, Math.round((new Date(at).getTime() - new Date(s.joined_at).getTime()) / 1000)) });
        }
        left++;
      }
    }

    return Response.json({ status: 'ok', joined, left });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}