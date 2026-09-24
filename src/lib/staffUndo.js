import { base44 } from '@/api/base44Client';
import { pushBan, pushUnban } from '@/lib/renderBridge';
import { logStaffAction } from '@/lib/staffLog';

const BUILTINS = ['id', 'created_date', 'updated_date', 'created_by_id', 'created_by'];

// Copy of a record without built-in fields, so it can be restored or recreated.
export const snapshot = (rec) => Object.fromEntries(Object.entries(rec).filter(([k]) => !BUILTINS.includes(k)));

export const isBanType = (t) => t === 'Temporary Ban' || t === 'Permanent Ban';

// Re-applies an in-game ban when undoing something that lifted an active ban.
export const rebanOp = (mod) => (isBanType(mod.moderation_type) && mod.status === 'Active' ? [{ op: 'ban', data: snapshot(mod) }] : []);

export async function undoStaffAction(log, user) {
  const ops = JSON.parse(log.undo_ops);
  for (const op of ops) {
    if (op.op === 'update') await base44.entities[op.entity].update(op.id, op.data);
    else if (op.op === 'delete') await base44.entities[op.entity].delete(op.id);
    else if (op.op === 'create') await base44.entities[op.entity].create(op.data);
    else if (op.op === 'ban') await pushBan(op.data).catch(() => {});
    else if (op.op === 'unban') await pushUnban(op.username).catch(() => {});
  }
  await base44.entities.StaffLog.update(log.id, {
    undone: true,
    undone_by: user?.full_name || user?.email || 'Admin',
    undone_at: new Date().toISOString(),
  });
  await logStaffAction(user, 'action_undone', log.target, `Undid ${log.staff_username}'s action: ${log.detail}`);
}