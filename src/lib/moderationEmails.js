import { emailPlayer } from '@/lib/userEmails';

const ACCENT = { Warning: '#f59e0b', Mute: '#f59e0b', Kick: '#f97316', 'Temporary Ban': '#ef4444', 'Permanent Ban': '#b91c1c' };
const ICON = { Warning: '⚠️', Mute: '🔇', Kick: '👢', 'Temporary Ban': '⛔', 'Permanent Ban': '🚫' };
const fmt = (d) => (d ? new Date(d).toLocaleString() : new Date().toLocaleString());

// Sent to linked accounts when a moderation is issued.
export function emailModerationIssued(m) {
  return emailPlayer({
    robloxUsername: m.roblox_username,
    subject: `New ${m.moderation_type} on your account`,
    title: `${ICON[m.moderation_type] || '⚠️'} ${m.moderation_type} issued`,
    accent: ACCENT[m.moderation_type],
    body: `Hey ${m.roblox_username},\n\nYou just got a ${m.moderation_type.toLowerCase()} on Escape Tsunami for Developers. If you think this was a mistake, you can appeal it from the Member Portal.`,
    fields: [
      { name: 'Action', value: m.moderation_type },
      { name: 'Reason', value: m.reason },
      ...(m.duration ? [{ name: 'Duration', value: m.duration }] : []),
      { name: 'Issued', value: fmt(m.moderation_date) },
    ],
    ctaLabel: 'View or appeal',
  });
}

// Sent when staff edit, adjust, repeal or expire an existing moderation.
export function emailModerationChanged(before, after) {
  const lifted = before.status === 'Active' && after.status && after.status !== 'Active';
  const typeChanged = after.moderation_type && after.moderation_type !== before.moderation_type;
  const durationChanged = after.duration !== undefined && (after.duration || '') !== (before.duration || '');
  if (!lifted && !typeChanged && !durationChanged) return;
  const type = after.moderation_type || before.moderation_type;
  return emailPlayer({
    robloxUsername: before.roblox_username,
    subject: lifted ? `Your ${before.moderation_type} has been ${after.status.toLowerCase()}` : `Your ${before.moderation_type} was updated`,
    title: lifted ? `✅ ${before.moderation_type} ${after.status.toLowerCase()}` : '✏️ Moderation updated',
    accent: lifted ? '#22c55e' : '#8b5cf6',
    body: lifted
      ? `Hey ${before.roblox_username},\n\nGood news — your ${before.moderation_type.toLowerCase()} was lifted. You're all set.`
      : `Hey ${before.roblox_username},\n\nA staff member updated a moderation on your account. Here's what changed:`,
    fields: [
      { name: 'Action', value: typeChanged ? `${before.moderation_type} → ${type}` : type },
      ...(durationChanged ? [{ name: 'Duration', value: `${before.duration || 'None'} → ${after.duration || 'None'}` }] : []),
      ...(lifted ? [{ name: 'New status', value: after.status }] : []),
      { name: 'Reason', value: after.reason || before.reason },
    ],
  });
}

// Sent when a staff member picks up the player's appeal.
export function emailAppealAssigned(appeal) {
  return emailPlayer({
    robloxUsername: appeal.roblox_username,
    subject: 'A staff member is reviewing your appeal',
    title: '🔍 Your appeal is being reviewed',
    accent: '#8b5cf6',
    body: `Hey ${appeal.roblox_username},\n\nA staff member picked up your appeal and is looking into it now. We'll email you once there's a decision. You can also chat with staff from your appeal in the Member Portal.`,
    fields: [{ name: 'Status', value: 'Under review' }, { name: 'Updated', value: fmt() }],
    ctaLabel: 'Open my appeal',
    ctaUrl: `${window.location.origin}/my-appeals`,
  });
}