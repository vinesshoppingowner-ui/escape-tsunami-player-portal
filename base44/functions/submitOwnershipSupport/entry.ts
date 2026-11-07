import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const GROUP_EMAIL = 'support@escapetsunamifordevelopers.com';
const SITE_ORIGIN = 'https://escapetsunamifordevelopers.com';
const LEGACY_TEST_DOMAINS = ['@staffwaitrose.net', '@aquadropsupport.com'];

function isLegacyTestEmail(email) {
  const lower = String(email || '').trim().toLowerCase();
  return LEGACY_TEST_DOMAINS.some((d) => lower.endsWith(d));
}

function isStaffOrOwner(user) {
  if (!user) return false;
  const email = String(user.email || '').trim().toLowerCase();
  return (
    user.role === 'admin' ||
    user.role === 'staff' ||
    user.is_owner === true ||
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

      const matchedUsers = await base44.asServiceRole.entities.User.filter({ email: targetEmail }).catch(() => []);
      const matchedList = Array.isArray(matchedUsers) ? matchedUsers : matchedUsers?.items || [];
      if (matchedList.length === 0) {
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
        to: matchedList[0].email,
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
    const firstName =
      user.custom_display_name ||
      user.data?.custom_display_name ||
      user.full_name ||
      user.roblox_username ||
      user.data?.roblox_username ||
      user.email.split('@')[0];
    const robloxUsername = user.roblox_username || user.data?.roblox_username || 'Not linked';

    const replyParams = new URLSearchParams({
      ticket: ticketId,
      to: user.email,
      name: firstName,
      subject: subjectLine,
      msg: messageBody.slice(0, 500),
    });
    const replyUrl = `${SITE_ORIGIN}/support-reply?${replyParams.toString()}`;
    const gmailParams = new URLSearchParams({
      ticket: ticketId,
      to: user.email,
      name: firstName,
      subject: subjectLine,
      msg: messageBody.slice(0, 500),
      mode: 'gmail',
    });
    const gmailReplyUrl = `${SITE_ORIGIN}/support-reply?${gmailParams.toString()}`;

    const alertVars = {
      first_name: firstName,
      sender_email: user.email,
      roblox_username: robloxUsername,
      ticket_id: ticketId,
      subject_line: subjectLine,
      message_body: messageBody,
      reply_url: replyUrl,
      gmail_reply_url: gmailReplyUrl,
    };

    // Collect the Google Group address plus all real @escapetsunamifordevelopers.com and owner/admin managers
    const staffRecipients = new Set([GROUP_EMAIL]);
    const rawUsers = await base44.asServiceRole.entities.User.list().catch(() => []);
    const allUsers = Array.isArray(rawUsers) ? rawUsers : rawUsers?.items || [];
    for (const u of allUsers) {
      const em = String(u.email || '').trim().toLowerCase();
      if (!em || isLegacyTestEmail(em)) continue;
      const isDomainMember = em.endsWith('@escapetsunamifordevelopers.com');
      const isManager = u.role === 'admin' || u.is_owner === true || u.data?.is_owner === true;
      if (isDomainMember || isManager) {
        staffRecipients.add(em);
      }
    }

    // 1. Send confirmation receipt to the submitting player
    const confirmResult = await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      template_name: 'OwnershipSupportConfirmation',
      category: 'transactional',
      variables: {
        first_name: firstName,
        ticket_id: ticketId,
        subject_line: subjectLine,
        message_body: messageBody,
      },
    }).catch((err) => ({ error: err?.message || 'Confirmation failed' }));

    // 2. Send alert to the Google Group and all Ownership / Manager accounts
    const recipientList = Array.from(staffRecipients);
    const alertResults = await Promise.allSettled(
      recipientList.map((recipientEmail) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          template_name: 'OwnershipSupportAlert',
          category: 'transactional',
          variables: alertVars,
        })
      )
    );

    const deliveredCount = alertResults.filter(
      (r) => r.status === 'fulfilled' && r.value?.success !== false
    ).length;

    return Response.json({
      ok: true,
      ticket_id: ticketId,
      confirmation_sent: confirmResult?.success !== false && !confirmResult?.error,
      managers_notified: deliveredCount,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send support request' }, { status: 500 });
  }
}