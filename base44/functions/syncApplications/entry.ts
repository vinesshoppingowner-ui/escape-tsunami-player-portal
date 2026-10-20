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

    // --- LOOKUP PORTAL ACCOUNT BY ACCOUNT ID, EMAIL, OR ROBLOX USERNAME ---
    // Allows the external Staff Website (staff.escapetsunamifordevelopers.com)
    // to search a player's full portal account info using their Portal Account ID, email, or username.
    if (action === 'lookup_account') {
      const q = String(body.account_id || body.query || body.id || body.email || body.roblox_username || '').trim();
      if (!q) {
        return Response.json({ error: 'account_id or query is required' }, { status: 400 });
      }

      let foundUser: any = null;

      // 1. Direct ID lookup
      if (/^[0-9a-fA-F]{20,36}$/.test(q) || body.account_id || body.id) {
        foundUser = await base44.asServiceRole.entities.User.get(q).catch(() => null);
      }

      // 2. Fallback scan across users by ID, email, or roblox_username
      if (!foundUser) {
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000).catch(() => []);
        const lower = q.toLowerCase();
        foundUser = (allUsers || []).find((u: any) => {
          const idMatch = String(u.id || '').toLowerCase() === lower;
          const emailMatch = String(u.email || '').toLowerCase() === lower;
          const rbx = String(u.roblox_username || u.data?.roblox_username || '').toLowerCase();
          return idMatch || emailMatch || (rbx && rbx === lower);
        }) || null;
      }

      if (!foundUser) {
        return Response.json({ status: 'not_found', account: null }, { status: 404 });
      }

      const rbxName = foundUser.roblox_username || foundUser.data?.roblox_username || null;
      const lastIp = foundUser.last_ip || foundUser.data?.last_ip || null;
      const ipHistory = foundUser.ip_history || foundUser.data?.ip_history || (lastIp ? [lastIp] : []);

      const [
        moderationsPage,
        appealsPage,
        appsPage,
        bugReportsPage,
        streakPage,
        watchlistPage,
        notesPage,
        notificationsPage,
        verificationsPage,
        ipBansPage,
        blacklistPage,
      ] = await Promise.all([
        rbxName
          ? base44.asServiceRole.entities.Moderation.filter({ roblox_username: rbxName }, { sort: '-moderation_date', limit: 100 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        rbxName
          ? base44.asServiceRole.entities.Appeal.filter({ roblox_username: rbxName }, { sort: '-created_date', limit: 100 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        base44.asServiceRole.entities.ApplicationResponse.filter(
          rbxName
            ? { $or: [{ submitted_by_email: foundUser.email }, { roblox_username: rbxName }] }
            : { submitted_by_email: foundUser.email },
          { sort: '-created_date', limit: 100 }
        ).catch(() => ({ items: [] })),
        rbxName
          ? base44.asServiceRole.entities.BugReport.filter({ roblox_username: rbxName }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        rbxName
          ? base44.asServiceRole.entities.UserStreak.filter({ roblox_username: rbxName }, { sort: '-created_date', limit: 1 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        rbxName
          ? base44.asServiceRole.entities.WatchlistEntry.filter({ roblox_username: rbxName }, { sort: '-created_date', limit: 25 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        rbxName
          ? base44.asServiceRole.entities.PlayerNote.filter({ roblox_username: rbxName }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        rbxName
          ? base44.asServiceRole.entities.Notification.filter({ roblox_username: rbxName }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        base44.asServiceRole.entities.VerificationRequest.filter(
          rbxName
            ? { $or: [{ created_by_id: foundUser.id }, { roblox_username: rbxName }] }
            : { created_by_id: foundUser.id },
          { sort: '-created_date', limit: 25 }
        ).catch(() => ({ items: [] })),
        lastIp
          ? base44.asServiceRole.entities.IpBan.filter({ ip_address: lastIp }, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        base44.asServiceRole.entities.ApplicationBlacklist.filter(
          rbxName
            ? { $or: [{ identifier: String(foundUser.email || '').toLowerCase() }, { identifier: rbxName.toLowerCase() }, { roblox_username: rbxName.toLowerCase() }] }
            : { identifier: String(foundUser.email || '').toLowerCase() },
          { sort: '-created_date', limit: 10 }
        ).catch(() => ({ items: [] })),
      ]);

      return Response.json({
        status: 'ok',
        account: {
          id: foundUser.id,
          email: foundUser.email,
          full_name: foundUser.full_name || null,
          display_name: foundUser.custom_display_name || foundUser.data?.custom_display_name || foundUser.full_name || null,
          bio: foundUser.bio || foundUser.data?.bio || '',
          avatar_uri: foundUser.avatar_uri || foundUser.data?.avatar_uri || null,
          role: foundUser.role || 'user',
          is_owner: Boolean(foundUser.is_owner || foundUser.data?.is_owner),
          roblox_username: rbxName,
          roblox_user_id: foundUser.roblox_user_id || foundUser.data?.roblox_user_id || null,
          discord_id: foundUser.discord_id || foundUser.data?.discord_id || null,
          discord_username: foundUser.discord_username || foundUser.data?.discord_username || null,
          discord_avatar: foundUser.discord_avatar || foundUser.data?.discord_avatar || null,
          created_date: foundUser.created_date,
          updated_date: foundUser.updated_date,
          last_seen: foundUser.last_seen || foundUser.data?.last_seen || null,
          last_ip: lastIp,
          ip_history: ipHistory,
          ip_banned: (ipBansPage?.items || []).length > 0,
          ip_bans: ipBansPage?.items || [],
          banned: Boolean(foundUser.banned || foundUser.data?.banned),
          banned_reason: foundUser.banned_reason || foundUser.data?.banned_reason || null,
          banned_by: foundUser.banned_by || foundUser.data?.banned_by || null,
          appeals_locked: Boolean(foundUser.appeals_locked || foundUser.data?.appeals_locked),
          google_locked: Boolean(foundUser.google_locked || foundUser.data?.google_locked),
          force_password_reset: Boolean(foundUser.force_password_reset || foundUser.data?.force_password_reset),
          application_blacklisted: (blacklistPage?.items || []).length > 0,
          application_blacklist_entries: blacklistPage?.items || [],
          preferences: {
            accent: foundUser.accent || foundUser.data?.accent || 'cyan',
            landing_page: foundUser.landing_page || foundUser.data?.landing_page || '/',
            hide_online_status: Boolean(foundUser.hide_online_status || foundUser.data?.hide_online_status),
          },
        },
        moderations: moderationsPage?.items || [],
        appeals: appealsPage?.items || [],
        application_responses: appsPage?.items || [],
        bug_reports: bugReportsPage?.items || [],
        watchlist: watchlistPage?.items || [],
        staff_notes: notesPage?.items || [],
        notifications: notificationsPage?.items || [],
        verifications: verificationsPage?.items || [],
        streak: streakPage?.items?.[0] || null,
      });
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