import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Called by the staff website (not a logged-in portal user) to sync bug reports
// bidirectionally with the player portal. Auth is the shared game API key.
//
//   GET  /functions/syncBugReports                    → returns all reports (newest first)
//   POST /functions/syncBugReports { since_id, status }                              → pull reports (newer than since_id, optionally filtered by status)
//   POST /functions/syncBugReports { action: 'update', id, status }                  → update a report's status on the portal
//   POST /functions/syncBugReports { action: 'create', roblox_username, title, description, severity } → create a report on the portal

export default async function(req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // --- GET: return all reports ---
    if (req.method === 'GET') {
      const page = await base44.asServiceRole.entities.BugReport.filter({}, {
        sort: '-created_date',
        limit: 500,
      });
      return Response.json({
        status: 'ok',
        count: (page?.items || []).length,
        reports: (page?.items || []).map((r: any) => ({
          id: r.id,
          roblox_username: r.roblox_username,
          title: r.title,
          description: r.description,
          severity: r.severity,
          status: r.status,
          created_date: r.created_date,
          updated_date: r.updated_date,
          created_by_id: r.created_by_id,
        })),
      });
    }

    // --- POST: handle pull, update, or create ---
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));

      // --- UPDATE a report's status ---
      if (body.action === 'update' && body.id) {
        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.title) updateData.title = body.title;
        if (body.description) updateData.description = body.description;
        if (body.severity) updateData.severity = body.severity;

        if (Object.keys(updateData).length === 0) {
          return Response.json({ error: 'No fields to update' }, { status: 400 });
        }

        const updated = await base44.asServiceRole.entities.BugReport.update(body.id, updateData);
        return Response.json({ status: 'ok', report: { id: updated.id, status: updated.status } });
      }

      // --- CREATE a new report on the portal ---
      if (body.action === 'create') {
        if (!body.title || !body.description) {
          return Response.json({ error: 'title and description are required' }, { status: 400 });
        }
        const created = await base44.asServiceRole.entities.BugReport.create({
          roblox_username: body.roblox_username || 'Staff Website',
          title: body.title,
          description: body.description,
          severity: body.severity || 'Low',
          status: body.status || 'Submitted',
        });
        return Response.json({ status: 'ok', report: { id: created.id } });
      }

      // --- PULL reports (default, backwards-compatible) ---
      let since_id: string | null = body.since_id || null;
      let statusFilter: string | null = body.status || null;

      const query: any = {};
      if (statusFilter) query.status = statusFilter;

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
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}