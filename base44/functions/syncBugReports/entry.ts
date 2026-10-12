import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Called by the staff website (not a logged-in portal user) to pull all bug
// reports into the staff portal. Auth is the shared game API key — same as
// syncModeration, checkPlayerBan, getPlayerWarnings, and submit-game-logs.
//
// Supports:
//   GET  /functions/syncBugReports            → returns all reports (newest first)
//   POST /functions/syncBugReports { since_id, status } → returns reports newer than since_id, optionally filtered by status

export default async function(req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    let since_id: string | null = null;
    let statusFilter: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      since_id = body.since_id || null;
      statusFilter = body.status || null;
    }

    const query: any = {};
    if (statusFilter) query.status = statusFilter;
    if (since_id) {
      // Fetch all then filter by id ordering — the SDK doesn't support $gt on id
      // in a reliable way across all backends, so we fetch and slice.
    }

    const page = await base44.asServiceRole.entities.BugReport.filter(query, {
      sort: '-created_date',
      limit: 500,
    });

    let items = (page?.items || []).map((r: any) => ({
      id: r.id,
      roblox_username: r.roblox_username,
      title: r.title,
      description: r.description,
      severity: r.severity,
      status: r.status,
      created_date: r.created_date,
      updated_date: r.updated_date,
      created_by_id: r.created_by_id,
    }));

    if (since_id) {
      const idx = items.findIndex((r) => r.id === since_id);
      if (idx !== -1) items = items.slice(0, idx);
    }

    return Response.json({
      status: 'ok',
      count: items.length,
      reports: items,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}