import { base44 } from '@/api/base44Client';
import { renderEmail } from '@/lib/emailTemplate';

export async function findUserEmailByUsername(robloxUsername) {
  if (!robloxUsername) return null;
  try {
    const users = await base44.entities.User.filter({ roblox_username: robloxUsername }, undefined, 1);
    return users?.[0]?.email || null;
  } catch {
    return null;
  }
}

export async function resolveApplicantEmail(response) {
  if (!response) return null;
  if (response.submitted_by_email) return response.submitted_by_email;
  if (response.created_by_id) {
    try {
      const u = await base44.entities.User.get(response.created_by_id);
      if (u?.email) return u.email;
    } catch {}
  }
  if (response.roblox_username) {
    return await findUserEmailByUsername(response.roblox_username);
  }
  return null;
}

// Every email is sent as a branded embed-style HTML email.
// Optional: title, fields [{name, value}], accent (hex), ctaLabel, ctaUrl.
export async function emailPlayer({ robloxUsername, email, subject, body, ...embed }) {
  const to = email || (robloxUsername ? await findUserEmailByUsername(robloxUsername) : null);
  if (!to) return false;
  try {
    await base44.integrations.Core.SendEmail({
      to,
      subject,
      from_name: 'Escape Tsunami for Developers',
      body: renderEmail({ subject, body, ...embed }),
      text: body,
    });
    return true;
  } catch {
    return false;
  }
}

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const STATUS_ACCENTS = {
  submitted: '#22d3ee',
  under_review: '#f59e0b',
  accepted: '#22c55e',
  rejected: '#ef4444',
};

export async function sendApplicationUpdateEmail({
  response,
  application,
  eventType = 'status_update', // 'status_update' | 'applicant_edited' | 'submitted'
  previousStatus,
}) {
  if (!response) return false;
  const to = await resolveApplicantEmail(response);
  if (!to) return false;

  const appTitle = application?.title || response.application_title || 'Application';
  const slugOrId = application?.slug || application?.id || response.application_id || '';
  const directUrl = slugOrId
    ? `${window.location.origin}/apply/${slugOrId}`
    : `${window.location.origin}/applications`;

  const statusKey = response.status || 'submitted';
  const statusLabel = STATUS_LABELS[statusKey] || statusKey;
  const accent = STATUS_ACCENTS[statusKey] || '#22d3ee';
  const feedback = (response.applicant_feedback || '').trim();
  const retakeAllowed = Boolean(response.retake_allowed);

  let subject = `Application Update: ${appTitle}`;
  let title = `Your application was updated`;
  let body = `Hello${response.roblox_username ? ` ${response.roblox_username}` : ''},\n\nThere is an update on your application for "${appTitle}".`;

  if (eventType === 'applicant_edited') {
    subject = `Application Edited: ${appTitle}`;
    title = `Your application changes were saved`;
    body = `Hello${response.roblox_username ? ` ${response.roblox_username}` : ''},\n\nYour edited responses for "${appTitle}" have been saved and updated.`;
  } else if (statusKey === 'accepted') {
    subject = `Application Accepted: ${appTitle}`;
    title = `Congratulations! Your application was accepted`;
    body = `Hello${response.roblox_username ? ` ${response.roblox_username}` : ''},\n\nYour application for "${appTitle}" has been reviewed and accepted by our staff team!`;
  } else if (statusKey === 'rejected') {
    subject = `Application Status Update: ${appTitle}`;
    title = `Update on your "${appTitle}" application`;
    body = `Hello${response.roblox_username ? ` ${response.roblox_username}` : ''},\n\nThank you for applying for "${appTitle}". After careful review, your application was not accepted at this time.${retakeAllowed ? '\n\nStaff has granted you permission to submit a retake using the direct application link below.' : ''}`;
  } else if (statusKey === 'under_review') {
    subject = `Application Under Review: ${appTitle}`;
    title = `Your application is now Under Review`;
    body = `Hello${response.roblox_username ? ` ${response.roblox_username}` : ''},\n\nOur staff team is currently reviewing your application for "${appTitle}".`;
  } else if (retakeAllowed) {
    subject = `Retake Granted: ${appTitle}`;
    title = `You can retake "${appTitle}"`;
    body = `Hello${response.roblox_username ? ` ${response.roblox_username}` : ''},\n\nStaff has granted you permission to retake "${appTitle}". Click the button below to open the application directly.`;
  }

  if (feedback) {
    body += `\n\nStaff Feedback:\n"${feedback}"`;
  }

  const fields = [
    { name: 'Application', value: appTitle },
    { name: 'Status', value: statusLabel },
  ];
  if (previousStatus && previousStatus !== statusKey) {
    fields.push({ name: 'Previous Status', value: STATUS_LABELS[previousStatus] || previousStatus });
  }
  if (retakeAllowed) {
    fields.push({ name: 'Retake Eligibility', value: 'Allowed — You may re-apply' });
  }

  return await emailPlayer({
    email: to,
    subject,
    title,
    body,
    fields,
    accent,
    ctaLabel: 'Open Application Directly',
    ctaUrl: directUrl,
  });
}