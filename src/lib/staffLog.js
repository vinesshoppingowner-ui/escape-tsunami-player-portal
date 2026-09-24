import { base44 } from '@/api/base44Client';

/**
 * Records a staff action in the StaffLog entity for audit.
 * Optional undoOps (see staffUndo.js) let an admin revert the action later.
 * Swallows errors so logging never blocks the underlying action.
 */
export async function logStaffAction(user, action, target, detail, undoOps) {
  try {
    await base44.entities.StaffLog.create({
      staff_username: user?.full_name || user?.email || 'Unknown staff',
      action,
      target: target || '',
      detail,
      ...(undoOps?.length ? { undo_ops: JSON.stringify(undoOps) } : {}),
    });
  } catch {
    /* ignore */
  }
}