import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, code } = body;

    if (action === 'send') {
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Clean up old codes for this user
      await base44.asServiceRole.entities.LoginOtp.deleteMany({ email: user.email });

      // Create new code record
      await base44.asServiceRole.entities.LoginOtp.create({
        email: user.email,
        code: otpCode,
        expires_at: expiresAt,
      });

      // Send verification email
      const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
  <div style="background:#6366f1;color:#000;padding:16px 24px;border-radius:6px 6px 0 0;font-weight:700;font-size:18px;">Escape Tsunami Player Portal</div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;">
    <h2 style="margin:0 0 16px;color:#000;">Your verification code</h2>
    <p style="color:#6b7280;margin:0 0 16px;">Enter this code to complete your sign-in:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#6366f1;text-align:center;padding:16px;background:#f4f4f5;border-radius:6px;margin:16px 0;">${otpCode}</div>
    <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
  </div>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Your login verification code',
        body: html,
      });

      return Response.json({ ok: true });
    }

    if (action === 'verify') {
      if (!code) return Response.json({ error: 'Code is required' }, { status: 400 });

      const { items } = await base44.asServiceRole.entities.LoginOtp.filter(
        { email: user.email },
        { sort: '-created_date', limit: 1 }
      );

      if (!items || items.length === 0) {
        return Response.json({ error: 'No code found. Request a new one.' }, { status: 400 });
      }

      const record = items[0];
      const now = new Date();
      const expires = new Date(record.expires_at);

      if (now > expires) {
        await base44.asServiceRole.entities.LoginOtp.deleteMany({ id: record.id });
        return Response.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
      }

      if (record.code !== String(code).trim()) {
        return Response.json({ error: 'Wrong code. Try again.' }, { status: 400 });
      }

      // Correct - delete the used code
      await base44.asServiceRole.entities.LoginOtp.deleteMany({ id: record.id });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}