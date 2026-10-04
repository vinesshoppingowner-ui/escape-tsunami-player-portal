import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Admin-only: verify a Roblox account for the current portal user without OAuth or bio code.
// Looks up the username on Roblox, sets it on the user's record, and creates an approved VerificationRequest.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isStaff = user.role === 'admin' || user.role === 'staff' || (user.data && user.data.is_owner === true);
    if (!isStaff) return Response.json({ error: 'Admins only.' }, { status: 403 });

    const { username } = await req.json();
    const name = String(username || '').trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) return Response.json({ error: 'Enter a valid Roblox username.' }, { status: 400 });

    // Look up the Roblox user
    const found = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [name], excludeBannedUsers: false }),
    }).then((r) => r.json());

    const match = found.data?.[0];
    if (!match) return Response.json({ error: 'That Roblox user was not found.' }, { status: 400 });

    // Update the portal user's Roblox identity
    await base44.asServiceRole.entities.User.update(user.id, {
      roblox_username: match.name,
      roblox_user_id: String(match.id),
    });

    // Create an approved verification request for audit
    await base44.asServiceRole.entities.VerificationRequest.create({
      roblox_username: match.name,
      code: 'ADMIN-VERIFIED',
      status: 'approved',
      reviewer_note: `Admin-verified by ${user.email || user.full_name || 'staff'}`,
      created_by_id: user.id,
    });

    return Response.json({ username: match.name, roblox_user_id: String(match.id) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}