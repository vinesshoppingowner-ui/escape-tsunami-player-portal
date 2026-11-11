import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ADJECTIVES = ['blue', 'calm', 'cool', 'gold', 'fast', 'kind', 'pure', 'safe', 'warm', 'wild', 'bright', 'clear', 'lucky', 'sunny', 'swift'];
const NOUNS = ['wave', 'tide', 'surf', 'reef', 'star', 'moon', 'palm', 'cove', 'boat', 'fish', 'cloud', 'coast', 'pearl', 'shell', 'wind'];
const makeCode = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};
const isLegacyWeirdCode = (c) => !c || String(c).startsWith('ET-') || String(c).includes('-') || /\d/.test(String(c)) || String(c).length > 14;

const ROBLOX_ENDPOINTS = [
  'https://users.roblox.com',
  'https://users.roproxy.com',
];

async function resolveRobloxUser(usernameOrId) {
  const clean = String(usernameOrId || '').trim().replace(/^@/, '');
  for (const base of ROBLOX_ENDPOINTS) {
    try {
      if (/^\d+$/.test(clean)) {
        const res = await fetch(`${base}/v1/users/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.id && data?.name) return data;
        }
      }
      const res = await fetch(`${base}/v1/usernames/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [clean], excludeBannedUsers: false }),
      });
      if (!res.ok) continue;
      const lookup = await res.json();
      const rbx = lookup?.data?.[0];
      if (!rbx?.id) continue;

      const profRes = await fetch(`${base}/v1/users/${rbx.id}`);
      if (!profRes.ok) continue;
      const profile = await profRes.json();
      if (profile?.id) return profile;
    } catch {
      // Try next endpoint
    }
  }
  return null;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Please sign in first.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, username, code: clientCode, forceNew } = body;

    const userDb = base44.entities.VerificationRequest;
    const adminDb = base44.asServiceRole.entities.VerificationRequest;

    const getPendingForUser = async () => {
      const page = await adminDb.filter(
        { created_by_id: user.id, status: 'pending' },
        { sort: '-created_date', limit: 15 }
      );
      return Array.isArray(page) ? page : page?.items || [];
    };

    if (action === 'status') {
      const pending = await getPendingForUser();
      const latest = pending[0];
      if (!latest) return Response.json({ pending: null });
      let activeCode = latest.code;
      if (isLegacyWeirdCode(activeCode)) {
        activeCode = makeCode();
        await adminDb.update(latest.id, { code: activeCode }).catch(() => {});
      }
      return Response.json({
        pending: {
          username: latest.roblox_username,
          code: activeCode,
        },
      });
    }

    if (action === 'start') {
      const name = String(username || '').trim().replace(/^@/, '');
      if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) {
        return Response.json({ error: 'Enter a valid Roblox username (3–20 letters, numbers, or _).' }, { status: 400 });
      }

      const existingPending = await getPendingForUser();
      const sameUserPending = existingPending.find(
        (r) => String(r.roblox_username || '').toLowerCase() === name.toLowerCase() && r.code
      );
      if (sameUserPending && !forceNew && !isLegacyWeirdCode(sameUserPending.code)) {
        return Response.json({ code: sameUserPending.code, username: sameUserPending.roblox_username });
      }

      const code = makeCode();
      if (sameUserPending) {
        await adminDb.update(sameUserPending.id, { code, roblox_username: name }).catch(() => {});
      } else {
        await userDb.create({ roblox_username: name, code, status: 'pending' });
      }
      return Response.json({ code, username: name });
    }

    if (action === 'check') {
      const pendingList = await getPendingForUser();
      if (pendingList.length === 0) {
        return Response.json({ error: 'Start verification first to get a bio code.' }, { status: 400 });
      }

      const targetName = String(username || pendingList[0].roblox_username || '').trim().replace(/^@/, '');
      const matchingReqs = pendingList.filter(
        (r) => !targetName || String(r.roblox_username || '').toLowerCase() === targetName.toLowerCase()
      );
      const candidates = matchingReqs.length > 0 ? matchingReqs : pendingList;

      const profile = await resolveRobloxUser(candidates[0].roblox_username);
      if (!profile) {
        return Response.json({ error: 'That Roblox user was not found. Check the spelling and try again.' }, { status: 400 });
      }

      const bioLower = String(profile.description || '').toLowerCase();
      const validCodes = new Set(
        candidates.map((r) => String(r.code || '').trim()).filter(Boolean)
      );
      if (clientCode) validCodes.add(String(clientCode).trim());

      let matchedReq = null;
      for (const reqItem of candidates) {
        const c = String(reqItem.code || '').trim().toLowerCase();
        if (c && bioLower.includes(c)) {
          matchedReq = reqItem;
          break;
        }
      }
      if (!matchedReq && clientCode && bioLower.includes(String(clientCode).trim().toLowerCase())) {
        matchedReq = candidates[0];
      }

      if (!matchedReq) {
        return Response.json(
          {
            error: `Code not found in @${profile.name}'s Roblox bio yet. Make sure "${candidates[0].code}" is saved in your Roblox "About" section and try again.`,
          },
          { status: 400 }
        );
      }

      await adminDb.update(matchedReq.id, {
        status: 'approved',
        roblox_username: profile.name,
        reviewer_note: 'Auto-verified via bio code',
      });

      // Clean up any other duplicate pending requests from this user
      for (const other of pendingList) {
        if (other.id !== matchedReq.id) {
          await adminDb.delete(other.id).catch(() => {});
        }
      }

      const updatedFields = {
        roblox_username: profile.name,
        roblox_user_id: String(profile.id),
      };
      await base44.auth.updateMe(updatedFields);
      await base44.asServiceRole.entities.User.update(user.id, {
        ...updatedFields,
        data: {
          ...(user.data || {}),
          ...updatedFields,
        },
      }).catch(() => {});

      return Response.json({ username: profile.name, roblox_user_id: String(profile.id) });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}