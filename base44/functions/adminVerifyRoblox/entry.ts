import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const STAFF_DOMAIN = '@escapetsunamifordevelopers.com';

function isOwnerUser(user) {
  if (!user) return false;
  const email = String(user.email || '').trim().toLowerCase();
  const isStaffMail = email.endsWith(STAFF_DOMAIN) && email.length > STAFF_DOMAIN.length;
  return Boolean(user.role === 'admin' || user.is_owner || user.data?.is_owner || isStaffMail);
}

async function resolveRobloxIdentity(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  let userObj = null;
  if (/^\d+$/.test(raw)) {
    const res = await fetch(`https://users.roblox.com/v1/users/${raw}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id && data.name) {
        userObj = {
          id: data.id,
          name: data.name,
          displayName: data.displayName || data.name,
        };
      }
    }
  } else {
    const res = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [raw], excludeBannedUsers: false }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      const match = data?.data?.[0];
      if (match) {
        userObj = {
          id: match.id,
          name: match.name,
          displayName: match.displayName || match.name,
        };
      }
    }
  }

  if (!userObj) return null;

  let headshot = null;
  try {
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userObj.id}&size=150x150&format=Png&isCircular=false`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (thumbRes.ok) {
      const thumbData = await thumbRes.json();
      headshot = thumbData?.data?.[0]?.imageUrl || null;
    }
  } catch {
    // optional headshot
  }

  return { ...userObj, headshot };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const actor = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!actor) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isOwnerUser(actor)) {
      return Response.json({ error: 'Only the portal owner can directly link Roblox accounts.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'self';

    // Action: history — list recent admin/owner account link actions
    if (action === 'history') {
      const page = await base44.asServiceRole.entities.VerificationRequest.filter(
        { code: { $in: ['OWNER-LINKED', 'ADMIN-VERIFIED'] } },
        { sort: '-created_date', limit: 25 }
      );
      const items = (page?.items || []).map((item) => {
        let parsedTarget = '';
        const note = item.reviewer_note || '';
        const match = note.match(/for\s+([^\s(]+)/i);
        if (match) parsedTarget = match[1];
        return {
          id: item.id,
          roblox_username: item.roblox_username,
          target_email: parsedTarget,
          reviewer_note: note,
          created_date: item.created_date,
        };
      });
      return Response.json({ history: items });
    }

    // Legacy self-verify fallback if called with { username } only
    if (action === 'self' && body.username && !body.email) {
      const robloxUser = await resolveRobloxIdentity(body.username);
      if (!robloxUser) return Response.json({ error: 'That Roblox user was not found.' }, { status: 400 });

      await base44.asServiceRole.entities.User.update(actor.id, {
        roblox_username: robloxUser.name,
        roblox_user_id: String(robloxUser.id),
      });

      await base44.asServiceRole.entities.VerificationRequest.create({
        roblox_username: robloxUser.name,
        code: 'ADMIN-VERIFIED',
        status: 'approved',
        reviewer_note: `Admin-verified for ${actor.email} by ${actor.email}`,
      });

      return Response.json({ username: robloxUser.name, roblox_user_id: String(robloxUser.id) });
    }

    // Actions: 'preview' and 'confirm'
    const emailQuery = String(body.email || '').trim().toLowerCase();
    const robloxInput = String(body.robloxInput || '').trim();
    if (!emailQuery || !robloxInput) {
      return Response.json({ error: 'Both portal user email (or ID) and Roblox username/ID are required.' }, { status: 400 });
    }

    // Find target portal user
    const allUsers = await base44.asServiceRole.entities.User.list();
    const usersList = Array.isArray(allUsers) ? allUsers : allUsers?.items || [];
    const targetUser = usersList.find(
      (u) =>
        String(u.email || '').trim().toLowerCase() === emailQuery ||
        String(u.id || '').trim().toLowerCase() === emailQuery
    );

    if (!targetUser) {
      return Response.json(
        { error: `No registered portal account found matching "${body.email}". Make sure the user has signed up first.` },
        { status: 404 }
      );
    }

    // Resolve Roblox account via Roblox API
    const robloxUser = await resolveRobloxIdentity(robloxInput);
    if (!robloxUser) {
      return Response.json(
        { error: `Could not find a Roblox account matching "${robloxInput}". Check the username or ID.` },
        { status: 404 }
      );
    }

    // Check if another portal user already has this Roblox identity
    const conflictRecord = usersList.find((u) => {
      if (u.id === targetUser.id) return false;
      const uName = String(u.roblox_username || u.data?.roblox_username || '').toLowerCase();
      const uId = String(u.roblox_user_id || u.data?.roblox_user_id || '');
      return (
        (uId && uId === String(robloxUser.id)) ||
        (uName && uName === robloxUser.name.toLowerCase())
      );
    });

    const targetExistingUsername = targetUser.roblox_username || targetUser.data?.roblox_username || '';
    const targetExistingId = targetUser.roblox_user_id || targetUser.data?.roblox_user_id || '';
    const hasDifferentExistingLink =
      Boolean(targetExistingUsername) &&
      targetExistingUsername.toLowerCase() !== robloxUser.name.toLowerCase();

    const previewPayload = {
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name || targetUser.data?.custom_display_name || '',
      },
      robloxUser,
      conflictUser: conflictRecord
        ? {
            id: conflictRecord.id,
            email: conflictRecord.email,
            roblox_username: conflictRecord.roblox_username || conflictRecord.data?.roblox_username,
          }
        : null,
      existingLink: hasDifferentExistingLink
        ? { username: targetExistingUsername, userId: targetExistingId }
        : null,
    };

    if (action === 'preview') {
      return Response.json(previewPayload);
    }

    if (action === 'confirm') {
      const forceOverwrite = Boolean(body.forceOverwrite);
      if ((conflictRecord || hasDifferentExistingLink) && !forceOverwrite) {
        return Response.json(
          {
            error: conflictRecord
              ? `Roblox account @${robloxUser.name} is already linked to ${conflictRecord.email}. Confirm overwrite to proceed.`
              : `${targetUser.email} is already linked to @${targetExistingUsername}. Confirm overwrite to replace it.`,
          },
          { status: 409 }
        );
      }

      // If another user had this Roblox account and forceOverwrite is true, unlink it from the old user
      if (conflictRecord && forceOverwrite) {
        await base44.asServiceRole.entities.User.update(conflictRecord.id, {
          roblox_username: '',
          roblox_user_id: '',
        });
      }

      // Update target portal user with the resolved Roblox username and ID
      await base44.asServiceRole.entities.User.update(targetUser.id, {
        roblox_username: robloxUser.name,
        roblox_user_id: String(robloxUser.id),
        roblox_verified_at: new Date().toISOString(),
      });

      const prevNote = hasDifferentExistingLink ? ` (replaced @${targetExistingUsername})` : '';
      const conflictNote = conflictRecord ? ` (moved from ${conflictRecord.email})` : '';
      const auditSummary = `Linked @${robloxUser.name} (ID ${robloxUser.id}) for ${targetUser.email} by ${actor.email}${prevNote}${conflictNote}`;

      await Promise.allSettled([
        base44.asServiceRole.entities.VerificationRequest.create({
          roblox_username: robloxUser.name,
          code: 'OWNER-LINKED',
          status: 'approved',
          reviewer_note: auditSummary,
        }),
        base44.asServiceRole.entities.StaffLog.create({
          staff_username: actor.email || actor.full_name || 'Owner',
          action: 'permissions_changed',
          target: `${targetUser.email} → @${robloxUser.name}`,
          detail: auditSummary,
        }),
        base44.asServiceRole.entities.Notification.create({
          roblox_username: robloxUser.name,
          title: 'Roblox Account Linked',
          body: `Your portal account (${targetUser.email}) has been linked to Roblox user @${robloxUser.name} by Ownership.`,
          type: 'staff_message',
          read: false,
        }),
      ]);

      return Response.json({
        ok: true,
        targetUser: previewPayload.targetUser,
        robloxUser,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}