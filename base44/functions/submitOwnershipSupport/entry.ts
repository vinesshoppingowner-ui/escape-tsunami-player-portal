import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const GROUP_EMAIL = 'support@escapetsunamifordevelopers.com';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || !user.email) {
      return Response.json({ error: 'Please sign in to submit an Ownership Support request.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const subjectLine = String(body.subject || '').trim();
    const messageBody = String(body.message || '').trim();

    if (!subjectLine || !messageBody) {
      return Response.json({ error: 'Both a subject and message are required.' }, { status: 400 });
    }
    if (subjectLine.length > 160 || messageBody.length > 4000) {
      return Response.json({ error: 'Your subject or message exceeds the maximum length.' }, { status: 400 });
    }

    const ticketId = 'OWN-' + Date.now().toString(36).toUpperCase().slice(-6);
    const firstName = user.custom_display_name || user.data?.custom_display_name || user.full_name || user.roblox_username || user.data?.roblox_username || user.email.split('@')[0];
    const robloxUsername = user.roblox_username || user.data?.roblox_username || 'Not linked';

    // 1. Send automatic confirmation email to the authenticated player
    const confirmRes = await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      template_name: 'OwnershipSupportConfirmation',
      category: 'transactional',
      variables: {
        first_name: firstName,
        ticket_id: ticketId,
        subject_line: subjectLine,
        message_body: messageBody,
      },
    });

    // 2. Forward the support ticket to the Google Group email + any registered staff/admin accounts on @escapetsunamifordevelopers.com
    const alertVars = {
      first_name: firstName,
      sender_email: user.email,
      roblox_username: robloxUsername,
      ticket_id: ticketId,
      subject_line: subjectLine,
      message_body: messageBody,
    };

    const recipients = new Set([GROUP_EMAIL]);
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 200).catch(() => []);
    for (const u of allUsers || []) {
      const em = String(u.email || '').trim().toLowerCase();
      if (em && (u.role === 'admin' || u.data?.is_owner === true || em.endsWith('@escapetsunamifordevelopers.com'))) {
        recipients.add(em);
      }
    }

    await Promise.allSettled(
      Array.from(recipients).map((recipientEmail) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          template_name: 'OwnershipSupportAlert',
          category: 'transactional',
          variables: alertVars,
        })
      )
    );

    return Response.json({
      ok: true,
      ticket_id: ticketId,
      confirmation_sent: confirmRes?.success !== false,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send support request' }, { status: 500 });
  }
}