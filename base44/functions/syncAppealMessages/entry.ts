import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { waitUntil } from 'base44:runtime';

// Called by the staff website (not a logged-in portal user) to sync appeal chat
// messages and appeal thread status bidirectionally with the player portal.
// Auth is the shared game API key — same as syncBugReports and syncModeration.
//
//   GET  /functions/syncAppealMessages                                → returns all appeals (newest first)
//   POST /functions/syncAppealMessages { action: 'pull_messages', appeal_id, since_id? }    → pull messages for an appeal
//   POST /functions/syncAppealMessages { action: 'pull_appeals', since_id? }               → pull appeals (newest first)
//   POST /functions/syncAppealMessages { action: 'create_message', appeal_id, roblox_username, sender_name, message, sender_is_staff?, image_uri?, video_url?, internal? }  → create a message from staff site
//   POST /functions/syncAppealMessages { action: 'update_appeal', id, thread_status?, chat_locked?, status?, staff_response?, assigned_to?, assigned_to_email? }  → update appeal thread state
//   POST /functions/syncAppealMessages { action: 'delete_message', id }                     → delete a message

export default async function(req: Request): Promise<Response> {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== secrets.get('GAME_LOG_API_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // --- GET: return all appeals (newest first) ---
    if (req.method === 'GET') {
      const page = await base44.asServiceRole.entities.Appeal.filter({}, {
        sort: '-created_date',
        limit: 500,
      });
      return Response.json({
        status: 'ok',
        count: (page?.items || []).length,
        appeals: (page?.items || []).map((a: any) => ({
          id: a.id,
          moderation_id: a.moderation_id,
          roblox_username: a.roblox_username,
          status: a.status,
          thread_status: a.thread_status,
          chat_locked: a.chat_locked,
          staff_response: a.staff_response,
          assigned_to: a.assigned_to,
          assigned_to_email: a.assigned_to_email,
          can_reappeal: a.can_reappeal,
          admin_locked: a.admin_locked,
          created_date: a.created_date,
          updated_date: a.updated_date,
        })),
      });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json().catch(() => ({}));

    // --- PULL messages for an appeal ---
    if (body.action === 'pull_messages') {
      if (!body.appeal_id) {
        return Response.json({ error: 'appeal_id is required' }, { status: 400 });
      }
      const page = await base44.asServiceRole.entities.AppealMessage.filter(
        { appeal_id: body.appeal_id },
        { sort: 'created_date', limit: 500 }
      );
      let items = (page?.items || []).map((m: any) => ({
        id: m.id,
        appeal_id: m.appeal_id,
        roblox_username: m.roblox_username,
        sender_name: m.sender_name,
        sender_is_staff: m.sender_is_staff,
        message: m.message,
        image_uri: m.image_uri,
        video_url: m.video_url,
        internal: m.internal,
        created_date: m.created_date,
      }));

      if (body.since_id) {
        const idx = items.findIndex((m) => m.id === body.since_id);
        if (idx !== -1) items = items.slice(0, idx);
      }

      return Response.json({ status: 'ok', count: items.length, messages: items });
    }

    // --- PULL appeals (newest first) ---
    if (body.action === 'pull_appeals') {
      const page = await base44.asServiceRole.entities.Appeal.filter({}, {
        sort: '-created_date',
        limit: 500,
      });
      let items = (page?.items || []).map((a: any) => ({
        id: a.id,
        moderation_id: a.moderation_id,
        roblox_username: a.roblox_username,
        status: a.status,
        thread_status: a.thread_status,
        chat_locked: a.chat_locked,
        staff_response: a.staff_response,
        assigned_to: a.assigned_to,
        assigned_to_email: a.assigned_to_email,
        can_reappeal: a.can_reappeal,
        admin_locked: a.admin_locked,
        created_date: a.created_date,
        updated_date: a.updated_date,
      }));

      if (body.since_id) {
        const idx = items.findIndex((a) => a.id === body.since_id);
        if (idx !== -1) items = items.slice(0, idx);
      }

      return Response.json({ status: 'ok', count: items.length, appeals: items });
    }

    // --- CREATE a message from the staff website ---
    if (body.action === 'create_message') {
      if (!body.appeal_id || !body.roblox_username) {
        return Response.json({ error: 'appeal_id and roblox_username are required' }, { status: 400 });
      }
      const created = await base44.asServiceRole.entities.AppealMessage.create({
        appeal_id: body.appeal_id,
        roblox_username: body.roblox_username,
        sender_name: body.sender_name || 'Staff Website',
        sender_is_staff: body.sender_is_staff !== false,
        message: body.message || '',
        image_uri: body.image_uri || undefined,
        video_url: body.video_url || undefined,
        internal: body.internal || false,
      });
      return Response.json({ status: 'ok', message: { id: created.id } });
    }

    // --- UPDATE an appeal's thread state ---
    if (body.action === 'update_appeal' && body.id) {
      const updateData: any = {};
      if (body.thread_status) updateData.thread_status = body.thread_status;
      if (body.chat_locked !== undefined) updateData.chat_locked = body.chat_locked;
      if (body.status) updateData.status = body.status;
      if (body.staff_response !== undefined) updateData.staff_response = body.staff_response;
      if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
      if (body.assigned_to_email !== undefined) updateData.assigned_to_email = body.assigned_to_email;

      if (Object.keys(updateData).length === 0) {
        return Response.json({ error: 'No fields to update' }, { status: 400 });
      }

      const updated = await base44.asServiceRole.entities.Appeal.update(body.id, updateData);
      return Response.json({ status: 'ok', appeal: { id: updated.id } });
    }

    // --- DELETE a message ---
    if (body.action === 'delete_message' && body.id) {
      await base44.asServiceRole.entities.AppealMessage.delete(body.id);
      return Response.json({ status: 'ok' });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}