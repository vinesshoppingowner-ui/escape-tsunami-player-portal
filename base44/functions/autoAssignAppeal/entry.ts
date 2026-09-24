import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Assigns a new appeal to the eligible staff member with the fewest open appeals.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const { appeal_id } = await req.json();
    if (!appeal_id) return Response.json({ error: 'appeal_id required' }, { status: 400 });

    const settings = (await db.SiteSettings.list())?.[0];
    if (!settings?.auto_assign_appeals) return Response.json({ skipped: 'auto-assign is off' });

    const appeal = await db.Appeal.get(appeal_id);
    if (!appeal || appeal.assigned_to_email || appeal.removed) return Response.json({ skipped: 'already assigned or removed' });

    const users = (await db.User.list()) || [];
    const denied = (u) => u.denied_permissions || u.data?.denied_permissions || [];
    const eligible = (role) => users.filter((u) => u.role === role && !u.banned && !denied(u).includes('auto_assign'));
    let pool = eligible('staff');
    if (!pool.length) pool = eligible('admin');
    if (!pool.length) return Response.json({ skipped: 'no eligible staff' });

    const open = (await db.Appeal.filter({ status: { $in: ['Pending', 'Under Review'] } }, '-created_date', 1000)) || [];
    const load = (email) => open.filter((a) => a.assigned_to_email === email && !a.removed).length;
    const lastAssigned = (email) => Math.max(0, ...open.filter((a) => a.assigned_to_email === email).map((a) => new Date(a.assigned_at || 0).getTime()));
    pool.sort((a, b) => load(a.email) - load(b.email) || lastAssigned(a.email) - lastAssigned(b.email));
    const pick = pool[0];
    const name = pick.full_name || pick.email;

    await db.Appeal.update(appeal_id, { assigned_to: name, assigned_to_email: pick.email, assigned_at: new Date().toISOString() });
    await db.StaffLog.create({ staff_username: 'Auto-assign', action: 'appeal_assigned', target: appeal.roblox_username || '', detail: `Auto-assigned appeal to ${name}` });

    return Response.json({ assigned_to: name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}