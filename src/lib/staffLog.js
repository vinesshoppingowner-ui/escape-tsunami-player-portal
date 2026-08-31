import { base44 } from '@/api/base44Client';

/**
 * Records a staff action in the StaffLog entity for audit.
 * Swallows errors so logging never blocks the underlying action.
 */
export async function logStaffAction(user, action, target, detail) {
  try {
    await base44.entities.StaffLog.create({
      staff_username: user?.full_name || user?.email || 'Unknown staff',
      action,
      target: target || '',
      detail,
    });
  } catch {
    /* ignore */
  }
}