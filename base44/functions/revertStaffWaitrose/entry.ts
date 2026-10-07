import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Try listing users via the internal API with service role token
    let allUsers = [];
    let fetchError = null;
    const config = base44.getConfig();
    try {
      const r = await fetch(`https://base44.app/api/apps/${config.appId}/users?limit=1000`, {
        headers: { 'X-App-Id': config.appId },
        signal: AbortSignal.timeout(15000)
      });
      const d = await r.json();
      allUsers = d.items || (Array.isArray(d) ? d : (d.users || d.data || []));
      if (!r.ok) fetchError = `Status ${r.status}: ${JSON.stringify(d).slice(0, 300)}`;
    } catch (e) {
      fetchError = e.message;
    }

    const staffWaitroseUsers = allUsers.filter(u =>
      u.email?.toLowerCase().endsWith('@staffwaitrose.net')
    );

    const results = [];
    const debug = { fetchError, allUsersCount: allUsers.length, sampleUser: allUsers[0] ? { id: allUsers[0].id, email: allUsers[0].email, role: allUsers[0].role } : null };
    for (const u of staffWaitroseUsers) {
      const updates = {};
      if (u.role === 'admin' || u.role === 'staff') {
        updates.role = 'user';
      }
      if (u.data?.is_owner === true) {
        updates.is_owner = false;
      }
      if (Object.keys(updates).length > 0) {
        // Update user role via the app users API
        const updateRes = await fetch(`https://base44.app/api/apps/prod/users/${u.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(updates),
          signal: AbortSignal.timeout(15000)
        });

        // Send notification
        await base44.asServiceRole.entities.Notification.create({
          roblox_username: u.data?.roblox_username || u.email,
          title: 'Staff Access Updated',
          body: 'Your staff access has been reverted to a standard user account. If you believe this is a mistake, please contact an administrator.',
          type: 'staff_message'
        });

        results.push({ email: u.email, oldRole: u.role, reverted: true });
      } else {
        results.push({ email: u.email, oldRole: u.role, reverted: false });
      }
    }

    return Response.json({ totalFound: staffWaitroseUsers.length, results, debug });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}