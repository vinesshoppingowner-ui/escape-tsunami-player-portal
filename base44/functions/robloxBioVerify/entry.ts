import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const WORDS = ['wave', 'tide', 'surf', 'coral', 'reef', 'shell', 'storm', 'ocean', 'pearl', 'drift', 'shore', 'foam'];
const makeCode = () => 'ET-' + Array.from({ length: 4 }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join('-');

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in first.' }, { status: 401 });
    const { action, username } = await req.json();

    // User-scoped client: RLS auto-sets created_by_id on create and auto-filters on read.
    const userDb = base44.entities.VerificationRequest;
    // Service-role client: bypasses RLS for status updates (only admins/staff can update).
    const adminDb = base44.asServiceRole.entities.VerificationRequest;

    if (action === 'start') {
      const name = String(username || '').trim();
      if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) return Response.json({ error: 'Enter a valid Roblox username.' }, { status: 400 });
      const code = makeCode();
      await userDb.create({ roblox_username: name, code, status: 'pending' });
      return Response.json({ code });
    }

    if (action === 'check') {
      const page = await userDb.filter({ status: 'pending' }, { sort: '-created_date', limit: 1 });
      const reqRec = page.items?.[0];
      if (!reqRec) return Response.json({ error: 'Start verification first.' }, { status: 400 });

      const lookup = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [reqRec.roblox_username], excludeBannedUsers: true }),
      }).then((r) => r.json());
      const rbx = lookup.data?.[0];
      if (!rbx) return Response.json({ error: 'That Roblox user was not found.' }, { status: 400 });

      const profile = await fetch(`https://users.roblox.com/v1/users/${rbx.id}`).then((r) => r.json());
      if (!String(profile.description || '').includes(reqRec.code)) {
        return Response.json({ error: 'Code not found in your Roblox bio yet. Save your bio and try again (it can take a minute).' }, { status: 400 });
      }

      await adminDb.update(reqRec.id, { status: 'approved', reviewer_note: 'Auto-verified via bio code' });
      await base44.auth.updateMe({ roblox_username: rbx.name, roblox_user_id: String(rbx.id) });
      return Response.json({ username: rbx.name });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}