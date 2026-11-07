import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const GROUP_EMAIL = 'support@escapetsunamifordevelopers.com';
const SITE_ORIGIN = 'https://escapetsunamifordevelopers.com';

function isStaffOrOwner(user) {
  if (!user) return false;
  const email = String(user.email || '').trim().toLowerCase();
  return (
    user.role === 'admin' ||
    user.role === 'staff' ||
    user.data?.is_owner === true ||
    email.endsWith('@escapetsunamifordevelopers.com')
  );
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || !user.email) {
      return Response.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Staff / Ownership direct reply to a player's ticket
    if (body.action === 'staff_reply') {
      if (!isStaffOrOwner(user)) {
        return Response.json({ error: 'Only Ownership and Staff can send support replies.' }, { status: 403 });
      }
      const targetEmail = String(body.to_email || '').trim().toLowerCase();
      const ticketId = String(body.ticket_id || 'OWN-SUPPORT').trim();
      const subjectLine = String(body.subject || 'Ownership Support Inquiry').trim();
      const replyBody = String(body.reply_message || '').trim();

      if (!targetEmail || !replyBody) {
        return Response.json({ error: 'Recipient email and reply message are required.' }, { status: 400 });
      }

      // Verify targetEmail belongs to a registered app user
      const matchedUsers = await base44.asServiceRole.entities.User.filter({ email: targetEmail }).catch(() => []);
      if (!matchedUsers || matchedUsers.length === 0) {
        return Response.json({ error: 'Could not find a registered portal member with that email.' }, { status: 404 });
      }

      const staffName =
        user.custom_display_name ||
        user.data?.custom_display_name ||
        user.full_name ||
        user.roblox_username ||
        user.data?.roblox_username ||
        'Ownership Support';

      const sendRes = await base44.asServiceRole.integrations.Core.SendEmail({
        to: matchedUsers[0].email,
        template_name: 'OwnershipSupportReply',
        category: 'transactional',
        variables: {
          ticket_id: ticketId,
          subject_line: subjectLine,
          reply_body: replyBody,
          staff_name: staffName,
        },
      });

      return Response.json({
        ok: true,
        sent: sendRes?.success !== false,
      });
    }

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

    const replyParams = new URLSearchParams({
      ticket: ticketId,
      to: user.email,
      name: firstName,
      subject: subjectLine,
      msg: messageBody.slice(0, 600),
    });
    const replyUrl = `${SITE_ORIGIN}/support-reply?${replyParams.toString()}`;
    const replySubject = `Re: ${subjectLine} (${ticketId})`;
    const replyQuote = `Hi ${firstName},\n\n\n\n---\nTicket ${ticketId}: "${subjectLine}"\n${messageBody.slice(0, 500)}`;
    const gmailReplyUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(user.email)}&su=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyQuote)}`;
    const mailtoReplyUrl = `mailto:${user.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyQuote)}`;

    const alertVars = {
      first_name: firstName,
      sender_email: user.email,
      roblox_username: robloxUsername,
      ticket_id: ticketId,
      subject_line: subjectLine,
      message_body: messageBody,
      reply_url: replyUrl,
      gmail_reply_url: gmailReplyUrl,
      mailto_reply_url: mailtoReplyUrl,
    };

    // Only send to the Google Group address and @escapetsunamifordevelopers.com Google Group members
    const staffRecipients = new Set([GROUP_EMAIL]);
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 200).catch(() => []);
    for (const u of allUsers || []) {
      const em = String(u.email || '').trim().toLowerCase();
      if (em && em.endsWith('@escapetsunamifordevelopers.com')) {
        staffRecipients.add(em);
      }
    }

    // 1. Send automatic confirmation email to the authenticated player
    // 2. Send the alert to the Google Group + registered staff/admin accounts
    const [confirmResult, ...alertResults] = await Promise.allSettled([
      base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        template_name: 'OwnershipSupportConfirmation',
        category: 'transactional',
        variables: {
          first_name: firstName,
          ticket_id: ticketId,
          subject_line: subjectLine,
          message_body: messageBody,
        },
      }),
      ...Array.from(staffRecipients).map((recipientEmail) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          from_name: `${firstName} via Ownership Support`,
          template_name: 'OwnershipSupportAlert',
          category: 'transactional',
          variables: alertVars,
        })
      ),
    ]);
    const alertResult = alertResults.find((r) => r.status === 'fulfilled') || alertResults[0];

    if (confirmResult.status === 'rejected' && alertResult.status === 'rejected') {
      const msg = alertResult.reason?.message || confirmResult.reason?.message || 'Failed to send support email.';
      return Response.json({ error: msg }, { status: 429 });
    }

    return Response.json({
      ok: true,
      ticket_id: ticketId,
      confirmation_sent: confirmResult.status === 'fulfilled' && confirmResult.value?.success !== false,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send support request' }, { status: 500 });
  }
}