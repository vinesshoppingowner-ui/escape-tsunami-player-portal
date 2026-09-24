import { isOwner } from '@/lib/isOwner';

// Every power is ON by default; admins switch individual ones off per staff member.
export const STAFF_PERMISSIONS = [
  { key: 'issue_temp_bans', label: 'Issue temporary bans' },
  { key: 'issue_perm_bans', label: 'Issue permanent bans' },
  { key: 'edit_moderations', label: 'Adjust / repeal moderations in appeals' },
  { key: 'delete_moderations', label: 'Delete moderations' },
  { key: 'decide_appeals', label: 'Approve or deny appeals' },
  { key: 'auto_assign', label: 'Receive auto-assigned appeals' },
];

export const deniedPermissions = (user) => user?.denied_permissions || user?.data?.denied_permissions || [];

export function can(user, key) {
  if (isOwner(user)) return true;
  return !deniedPermissions(user).includes(key);
}

export function canIssueType(user, type) {
  if (type === 'Temporary Ban') return can(user, 'issue_temp_bans');
  if (type === 'Permanent Ban') return can(user, 'issue_perm_bans');
  return true;
}