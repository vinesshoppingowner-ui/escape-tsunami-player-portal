import { base44 } from '@/api/base44Client';
import { logStaffAction } from '@/lib/staffLog';
import { pushUnban } from '@/lib/renderBridge';

// action: 'Repealed' | 'Expired' | 'delete'
export async function bulkModerationAction(items, action, user) {
  for (const m of items) {
    if (action === 'delete') await base44.entities.Moderation.delete(m.id);
    else await base44.entities.Moderation.update(m.id, { status: action });
    if (m.moderation_type?.includes('Ban') && m.status === 'Active') {
      try { await pushUnban(m.roblox_username); } catch { /* game server offline */ }
    }
    await logStaffAction(
      user,
      action === 'delete' ? 'moderation_deleted' : 'moderation_edited',
      m.roblox_username,
      action === 'delete' ? `Bulk deleted ${m.moderation_type} — ${m.reason}` : `Bulk set ${m.moderation_type} to ${action}`
    );
  }
}