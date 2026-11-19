import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Ensures any newly created appeal starts as Pending with no staff decision fields,
// and assigns it to the eligible staff member with the fewest open appeals if auto-assign is on.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const { appeal_id } = await req.json().catch(() => ({}));
    if (!appeal_id) return Response.json({ error: 'appeal_id required' }, { status: 400 });

    const appeal = await db.Appeal.get(appeal_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!appeal) return Response.json({ error: 'Appeal not found' }, { status: 404 });

    // Enforce that newly created appeals always start as Pending with staff decision fields cleared.
    const needsReset =
      appeal.status !== 'Pending' ||
      Boolean(appeal.decided_by) ||
      Boolean(appeal.decided_at) ||
      Boolean(appeal.staff_response) ||
      Boolean(appeal.internal_notes) ||
      appeal.thread_status !== 'Awaiting Review';

    if (needsReset) {
      await db.Appeal.update(appeal_id, {
        status: 'Pending',
        thread_status: 'Awaiting Review',
        decided_by: null,
        decided_at: null,
        staff_response: null,
        internal_notes: null,
        admin_locked: false,
        locked_by: null,
        removed: false,
        removed_by: null,
        removed_at: null,
        reappeal_after: null,
        reappeal_guidance: null,
        chat_locked: false,
      });
    }

    const settings = (await db.SiteSettings.list())?.[0];
    if (!settings?.auto_assign_appeals) {
      return Response.json({ ok: true, sanitized: needsReset, skipped: 'auto-assign is off' });
    }

    if (appeal.assigned_to_email || appeal.removed) {
      return Response.json({ ok: true, sanitized: needsReset, skipped: 'already assigned or removed' });
    }

    const users = (await db.User.list()) || [];
    const denied = (u: any) => u.denied_permissions || u.data?.denied_permissions || [];
    const eligible = (role: string) => users.filter((u: any) => u.role === role && !u.banned && !denied(u).includes('auto_assign'));
    let pool = eligible('staff');
    if (!pool.length) pool = eligible('admin');
    if (!pool.length) return Response.json({ ok: true, sanitized: needsReset, skipped: 'no eligible staff' });

    const openPage = await db.Appeal.filter({ status: { $in: ['Pending', 'Under Review'] } }, { sort: '-created_date', limit: 500 });
    const open = openPage?.items || openPage || [];
    const load = (email: string) => open.filter((a: any) => a.assigned_to_email === email && !a.removed).length;
    const lastAssigned = (email: string) =>
      Math.max(0, ...open.filter((a: any) => a.assigned_to_email === email).map((a: any) => new Date(a.assigned_at || 0).getTime()));
    pool.sort((a: any, b: any) => load(a.email) - load(b.email) || lastAssigned(a.email) - lastAssigned(b.email));
    const pick = pool[0];
    const name = pick.full_name || pick.email;

    await db.Appeal.update(appeal_id, {
      assigned_to: name,
      assigned_to_email: pick.email,
      assigned_at: new Date().toISOString(),
    });
    await db.StaffLog.create({
      staff_username: 'Auto-assign',
      action: 'appeal_assigned',
      target: appeal.roblox_username || '',
      detail: `Auto-assigned appeal to ${name}`,
    });

    return Response.json({ ok: true, sanitized: needsReset, assigned_to: name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}