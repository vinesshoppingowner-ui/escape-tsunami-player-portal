import { base44 } from '@/api/base44Client';

export async function findUserEmailByUsername(robloxUsername) {
  if (!robloxUsername) return null;
  try {
    const users = await base44.entities.User.filter({ roblox_username: robloxUsername }, undefined, 1);
    return users?.[0]?.email || null;
  } catch {
    return null;
  }
}

export async function emailPlayer({ robloxUsername, email, subject, body }) {
  const to = email || (robloxUsername ? await findUserEmailByUsername(robloxUsername) : null);
  if (!to) return false;
  try {
    await base44.integrations.Core.SendEmail({ to, subject, body });
    return true;
  } catch {
    return false;
  }
}