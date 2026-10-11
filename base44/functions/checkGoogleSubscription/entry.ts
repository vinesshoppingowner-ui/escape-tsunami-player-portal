import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ud = user.data || {};
    const googleLinked = ud.google_linked === true || ud.auth_provider === 'google';
    const googleSubscriber = ud.google_subscriber === true;

    // If not Google-linked, no ring
    if (!googleLinked) {
      return Response.json({ google_linked: false, google_subscriber: false, has_ring: false });
    }

    // Google-linked: check subscription status
    // Google One / Play subscription status is verified via the stored flag.
    // The flag can be set by an admin or a future Google Play Billing webhook.
    if (googleSubscriber) {
      return Response.json({ google_linked: true, google_subscriber: true, has_ring: true });
    }

    // Google-linked but no confirmed subscription — no ring
    return Response.json({ google_linked: true, google_subscriber: false, has_ring: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}