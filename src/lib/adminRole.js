import { base44 } from '@/api/base44Client';

const ROLE_KEY = 'et_admin_role';
const SESSION_FLAG = 'et_role_checked';

export function getAdminRole() {
  try {
    return localStorage.getItem(ROLE_KEY) || null;
  } catch {
    return null;
  }
}

export function setAdminRole(role) {
  localStorage.setItem(ROLE_KEY, role);
  // Also persist to user profile so it's shared across devices
  try {
    base44.auth.updateMe({ data: { admin_role: role } }).catch(() => {});
  } catch {}
}

export function hasRoleChecked() {
  try {
    return sessionStorage.getItem(SESSION_FLAG) === '1';
  } catch {
    return false;
  }
}

export function markRoleChecked() {
  try {
    sessionStorage.setItem(SESSION_FLAG, '1');
  } catch {}
}