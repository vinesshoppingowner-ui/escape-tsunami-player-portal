import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

const REDIRECT_URI = 'https://tsunami-shield-portal.base44.app/roblox-callback';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in first.' }, { status: 401 });

    const clientId = secrets.get('ROBLOX_CLIENT_ID');
    const clientSecret = secrets.get('ROBLOX_CLIENT_SECRET');
    const { action, state, code } = await req.json();

    if (action === 'start') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        scope: 'openid profile',
        response_type: 'code',
        state: state || '',
      });
      return Response.json({ url: `https://apis.roblox.com/oauth/v1/authorize?${params}` });
    }

    if (action === 'callback') {
      if (!code) return Response.json({ error: 'Missing code' }, { status: 400 });
      const tokenRes = await fetch('https://apis.roblox.com/oauth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });
      const token = await tokenRes.json();
      if (!tokenRes.ok) return Response.json({ error: token.error_description || 'Roblox sign-in failed' }, { status: 400 });

      const infoRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      const info = await infoRes.json();
      if (!infoRes.ok || !info.preferred_username) return Response.json({ error: 'Could not read your Roblox profile' }, { status: 400 });

      await base44.asServiceRole.entities.User.update(user.id, {
        roblox_username: info.preferred_username,
        roblox_user_id: String(info.sub),
      });
      return Response.json({ username: info.preferred_username, user_id: info.sub });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}