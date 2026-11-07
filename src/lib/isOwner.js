/**
 * Determines whether a user is an "owner" — either a platform admin
 * or a user with the is_owner flag set.
 */
export const STAFF_EMAIL_DOMAIN = '@escapetsunamifordevelopers.com';

export function isStaffEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith(STAFF_EMAIL_DOMAIN);
}

export function isOwner(user) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'staff') return true;
  if (user.data && user.data.is_owner === true) return true;
  if (isStaffEmail(user.email)) return true;
  return false;
}