import { base44 } from '@/api/base44Client';

/**
 * Printed sign-in badges travel as plain links, so they can't be recalled.
 * Revoking an account records its email here and every badge carrying it is
 * refused at the sign-in screen — the account itself can still sign in by hand.
 */

export const BADGE_REVOKED_MESSAGE =
  'This badge has been revoked. Ask a staff member for a new one, or sign in with your email and password.';

export const normalizeBadgeEmail = (email) => (email || '').trim().toLowerCase();

export async function isBadgeRevoked(email) {
  const target = normalizeBadgeEmail(email);
  if (!target) return false;
  try {
    const page = await base44.entities.BadgeRevocation.filter({ email: target }, { limit: 1 });
    const items = Array.isArray(page) ? page : page?.items || [];
    return items.length > 0;
  } catch {
    return false;
  }
}

export async function listRevokedBadges() {
  const page = await base44.entities.BadgeRevocation.list('-created_date', 100);
  return Array.isArray(page) ? page : page?.items || [];
}

export function revokeBadge(email, revokedBy, reason = '') {
  return base44.entities.BadgeRevocation.create({
    email: normalizeBadgeEmail(email),
    revoked_by: revokedBy || '',
    reason,
  });
}

export function restoreBadge(id) {
  return base44.entities.BadgeRevocation.delete(id);
}