import { base44 } from '@/api/base44Client';
import { logStaffAction } from '@/lib/staffLog';
import { pushUnban } from '@/lib/renderBridge';
import { emailPlayer } from '@/lib/userEmails';
import { sendAppealDecisionWebhook } from '@/lib/discordWebhook';
import { can } from '@/lib/staffPermissions';
import { rebanOp } from '@/lib/staffUndo';
import { isWebsiteBanAppeal } from '@/lib/banAppealGuard';

// Clears the account ban flag and any IP ban on the player's last known IP.
async function liftWebsiteBan(username) {
  const users = await base44.entities.User.list();
  const target = users.find((u) => (u.data?.roblox_username || u.roblox_username) === username);
  if (!target) return;
  await base44.entities.User.update(target.id, { banned: false });
  const ip = target.data?.last_ip || target.last_ip;
  if (ip) await base44.entities.IpBan.deleteMany({ ip_address: ip });
}

// Saves an appeal decision and runs every side effect (unban, notification, log, email, webhook).
export async function applyAppealDecision({
  appeal,
  moderation,
  user,
  status,
  staff_response = appeal.staff_response || '',
  internal_notes = appeal.internal_notes || '',
  can_reappeal = appeal.can_reappeal !== false,
  reappeal_after = appeal.reappeal_after || '',
  reappeal_guidance = appeal.reappeal_guidance || '',
}) {
  if (['Approved', 'Denied'].includes(status) && status !== appeal.status && !can(user, 'decide_appeals')) {
    throw new Error("You don't have permission to approve or deny appeals.");
  }
  const undoOps = [{
    op: 'update', entity: 'Appeal', id: appeal.id,
    data: { status: appeal.status, staff_response: appeal.staff_response || '', internal_notes: appeal.internal_notes || '', can_reappeal: appeal.can_reappeal !== false },
  }];
  const decided = ['Approved', 'Denied'].includes(status) && status !== appeal.status
    ? { decided_by: user?.full_name || user?.email || 'Staff', decided_at: new Date().toISOString() } : {};
  await base44.entities.Appeal.update(appeal.id, { status, staff_response, internal_notes, can_reappeal, reappeal_after: reappeal_after || null, reappeal_guidance, ...decided });
  if (status === 'Approved' && isWebsiteBanAppeal(appeal)) await liftWebsiteBan(appeal.roblox_username);
  if (status === 'Approved' && moderation && !moderation.unlisted && moderation.status !== 'Repealed') {
    await base44.entities.Moderation.update(moderation.id, { status: 'Repealed' });
    await pushUnban(appeal.roblox_username);
    undoOps.push({ op: 'update', entity: 'Moderation', id: moderation.id, data: { status: moderation.status } }, ...rebanOp(moderation));
  }
  await base44.entities.Notification.create({
    roblox_username: appeal.roblox_username,
    title: `Appeal ${status.toLowerCase()}`,
    body: staff_response || `Your appeal for ${moderation?.moderation_type || 'your moderation'} has been ${status.toLowerCase()}.`,
    type: 'appeal_decision',
    read: false,
  });
  await logStaffAction(user, 'appeal_decision', appeal.roblox_username, `Set appeal to ${status}${moderation ? ` (${moderation.moderation_type})` : ''}`, undoOps);
  await emailPlayer({
    robloxUsername: appeal.roblox_username,
    subject: `Your appeal has been ${status.toLowerCase()}`,
    title: { Approved: '✅ Appeal approved', Denied: '❌ Appeal denied', 'Under Review': '🔍 Appeal under review', Pending: '⏳ Appeal pending' }[status] || `Appeal ${status}`,
    accent: { Approved: '#22c55e', Denied: '#ef4444', 'Under Review': '#8b5cf6', Pending: '#f59e0b' }[status],
    body: status === 'Approved'
      ? `Hey ${appeal.roblox_username},\n\nGood news — your appeal was approved and the action on your account has been lifted.`
      : status === 'Denied'
      ? `Hey ${appeal.roblox_username},\n\nYour appeal was denied. You can reach out to staff in the Member Portal if you'd like to talk about it further.`
      : `Hey ${appeal.roblox_username},\n\nYour appeal is now under review. We'll let you know once there's a decision.`,
    fields: [
      { name: 'Decision', value: status },
      { name: 'Moderation', value: moderation?.moderation_type },
      { name: 'Original reason', value: moderation?.reason },
      ...(staff_response ? [{ name: 'Staff response', value: staff_response }] : []),
    ],
    ctaLabel: 'View appeal details',
  });
  await sendAppealDecisionWebhook({
    username: appeal.roblox_username,
    moderationType: moderation?.moderation_type,
    decision: status,
    staffName: user?.full_name || user?.email || 'Unknown staff',
    appealId: appeal.id,
  });
}