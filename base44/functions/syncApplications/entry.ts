import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Bidirectional sync endpoint for Applications, Form Settings, Responses, and Blacklist
// between the Member Portal and the Staff Website (staff.escapetsunamifordevelopers.com).
// Authenticates via shared x-api-key (GAME_LOG_API_KEY) or an authenticated admin/staff user.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = req.headers.get('x-api-key');
    const validKey = apiKey && apiKey === secrets.get('GAME_LOG_API_KEY');

    if (!validKey) {
      const user = await base44.auth.me().catch(() => null);
      const isStaffOrAdmin =
        user &&
        (user.role === 'admin' || user.role === 'staff' || user.data?.is_owner === true);
      if (!isStaffOrAdmin) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const fetchAllBundle = async () => {
      const [appsPage, respPage, blPage] = await Promise.all([
        base44.asServiceRole.entities.Application.filter({}, { sort: '-created_date', limit: 200 }),
        base44.asServiceRole.entities.ApplicationResponse.filter({}, { sort: '-created_date', limit: 500 }),
        base44.asServiceRole.entities.ApplicationBlacklist.filter({}, { sort: '-created_date', limit: 200 }),
      ]);
      const apps = appsPage?.items || [];
      const responses = respPage?.items || [];
      const blacklist = blPage?.items || [];

      const countsByApp: Record<string, number> = {};
      for (const r of responses) {
        if (r.application_id) {
          countsByApp[r.application_id] = (countsByApp[r.application_id] || 0) + 1;
        }
      }

      return {
        status: 'ok',
        count: apps.length,
        applications: apps.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          status: a.status || 'draft',
          category: a.category || 'General',
          icon: a.icon || '📋',
          slug: a.slug || '',
          success_message: a.success_message || '',
          auto_close_at: a.auto_close_at || null,
          response_count: countsByApp[a.id] ?? a.response_count ?? 0,
          questions: a.questions || '[]',
          settings: a.settings || '{}',
          created_by: a.created_by || null,
          created_date: a.created_date,
          updated_date: a.updated_date,
        })),
        responses,
        blacklist,
      };
    };

    if (req.method === 'GET') {
      return Response.json(await fetchAllBundle());
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'pull';

    if (action === 'pull') {
      return Response.json(await fetchAllBundle());
    }

    if (action === 'upsert_application' && body.application) {
      const a = body.application;
      if (!a.title) {
        return Response.json({ error: 'Application title is required' }, { status: 400 });
      }
      const data: any = {
        title: String(a.title).trim(),
        description: a.description ?? '',
        status: ['draft', 'open', 'closed'].includes(a.status) ? a.status : 'draft',
        category: a.category || 'General',
        icon: a.icon || '📋',
        slug: a.slug || String(a.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        success_message: a.success_message ?? '',
        auto_close_at: a.auto_close_at || null,
        questions: typeof a.questions === 'string' ? a.questions : JSON.stringify(a.questions || []),
        settings: typeof a.settings === 'string' ? a.settings : JSON.stringify(a.settings || {}),
      };

      let saved;
      if (a.id) {
        const existing = await base44.asServiceRole.entities.Application.get(a.id).catch(() => null);
        if (existing) {
          saved = await base44.asServiceRole.entities.Application.update(a.id, data);
        }
      }
      if (!saved && data.slug) {
        const bySlug = await base44.asServiceRole.entities.Application.filter({ slug: data.slug }, { limit: 1 });
        if (bySlug?.items?.[0]) {
          saved = await base44.asServiceRole.entities.Application.update(bySlug.items[0].id, data);
        }
      }
      if (!saved) {
        saved = await base44.asServiceRole.entities.Application.create(data);
      }

      return Response.json({ status: 'ok', application: saved });
    }

    if (action === 'delete_application' && body.id) {
      await base44.asServiceRole.entities.ApplicationResponse.deleteMany({ application_id: body.id });
      await base44.asServiceRole.entities.Application.delete(body.id);
      return Response.json({ status: 'ok' });
    }

    if (action === 'update_response' && body.id) {
      const existing = await base44.asServiceRole.entities.ApplicationResponse.get(body.id);
      if (!existing) {
        return Response.json({ error: 'Response not found' }, { status: 404 });
      }
      const updates: any = {
        reviewed_at: new Date().toISOString(),
      };
      if (body.status !== undefined) updates.status = body.status;
      if (body.staff_notes !== undefined) updates.staff_notes = body.staff_notes;
      if (body.applicant_feedback !== undefined) updates.applicant_feedback = body.applicant_feedback;
      if (body.retake_allowed !== undefined) updates.retake_allowed = Boolean(body.retake_allowed);
      if (body.staff_rating !== undefined) updates.staff_rating = Number(body.staff_rating) || 0;
      if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
      if (body.starred !== undefined) updates.starred = Boolean(body.starred);
      if (body.reviewed_by !== undefined) updates.reviewed_by = body.reviewed_by;

      const updated = await base44.asServiceRole.entities.ApplicationResponse.update(body.id, updates);

      const decided =
        updates.status &&
        updates.status !== existing.status &&
        (updates.status === 'accepted' || updates.status === 'rejected');
      const retakeGranted = updates.retake_allowed && !existing.retake_allowed;
      if ((decided || retakeGranted) && existing.roblox_username) {
        await base44.asServiceRole.entities.Notification.create({
          roblox_username: existing.roblox_username,
          title: decided ? `Application ${updates.status}` : 'You can retake an application',
          body:
            updates.applicant_feedback ||
            (decided
              ? `Your application for "${existing.application_title || 'Application'}" was ${updates.status}.`
              : `Staff allowed you to retake "${existing.application_title || 'Application'}".`),
          type: 'staff_message',
          read: false,
        });
      }

      return Response.json({ status: 'ok', response: updated });
    }

    if (action === 'delete_response' && body.id) {
      await base44.asServiceRole.entities.ApplicationResponse.delete(body.id);
      return Response.json({ status: 'ok' });
    }

    if (action === 'manage_blacklist') {
      if (body.op === 'remove' && body.id) {
        const entry = await base44.asServiceRole.entities.ApplicationBlacklist.get(body.id).catch(() => null);
        if (entry?.linked_moderation_id) {
          await base44.asServiceRole.entities.Moderation.update(entry.linked_moderation_id, { status: 'Repealed' }).catch(() => {});
        }
        await base44.asServiceRole.entities.ApplicationBlacklist.delete(body.id);
        return Response.json({ status: 'ok' });
      }
      if (body.op === 'add' && body.identifier) {
        const lower = String(body.identifier).trim().toLowerCase();
        const isEmail = /@/.test(lower) && /\./.test(lower);
        const robloxUsername = isEmail ? '' : (body.roblox_username || lower).toLowerCase();
        let linkedModerationId = '';
        if (robloxUsername) {
          const mod = await base44.asServiceRole.entities.Moderation.create({
            roblox_username: robloxUsername,
            moderation_type: 'Permanent Ban',
            reason: 'Blacklisted from applications',
            details: body.reason ? `Blacklisted from submitting application forms. Reason: ${body.reason}` : 'Blacklisted from submitting application forms.',
            status: 'Active',
            staff_member: body.banned_by || 'Staff Portal',
            moderation_date: new Date().toISOString(),
          });
          linkedModerationId = mod?.id || '';
        }
        const created = await base44.asServiceRole.entities.ApplicationBlacklist.create({
          identifier: lower,
          roblox_username: robloxUsername || undefined,
          reason: body.reason || '',
          banned_by: body.banned_by || 'Staff Portal',
          linked_moderation_id: linkedModerationId || undefined,
        });
        return Response.json({ status: 'ok', entry: created });
      }
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}