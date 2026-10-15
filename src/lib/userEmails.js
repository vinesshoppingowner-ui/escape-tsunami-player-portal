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