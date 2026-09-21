import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    // Validate shared secret — the Roblox game includes this in the X-Api-Key header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const chatLogs = Array.isArray(body.chat_logs) ? body.chat_logs : [];
    const exploitLogs = Array.isArray(body.exploit_logs) ? body.exploit_logs : [];

    let chatCreated = 0;
    let exploitCreated = 0;

    if (chatLogs.length > 0) {
      await base44.asServiceRole.entities.ChatLog.bulkCreate(
        chatLogs.map((log) => ({
          roblox_username: log.roblox_username,
          message: log.message,
          server_name: log.server_name || '',
          timestamp: log.timestamp || new Date().toISOString(),
        }))
      );
      chatCreated = chatLogs.length;
    }

    if (exploitLogs.length > 0) {
      await base44.asServiceRole.entities.ExploitLog.bulkCreate(
        exploitLogs.map((log) => ({
          roblox_username: log.roblox_username,
          exploit_type: log.exploit_type,
          details: log.details || '',
          server_name: log.server_name || '',
          timestamp: log.timestamp || new Date().toISOString(),
        }))
      );
      exploitCreated = exploitLogs.length;
    }

    return Response.json({
      status: 'ok',
      chat_logs_created: chatCreated,
      exploit_logs_created: exploitCreated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}