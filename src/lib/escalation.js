// Punishment ladder: each prior (non-repealed) offense moves the player one step up.
export const ESCALATION_LADDER = [
  { moderation_type: 'Warning', duration: '' },
  { moderation_type: 'Mute', duration: '24h' },
  { moderation_type: 'Kick', duration: '' },
  { moderation_type: 'Temporary Ban', duration: '3d' },
  { moderation_type: 'Temporary Ban', duration: '7d' },
  { moderation_type: 'Temporary Ban', duration: '30d' },
  { moderation_type: 'Permanent Ban', duration: '' },
];

export function suggestEscalation(priorModerations) {
  const offenses = priorModerations.filter((m) => m.status !== 'Repealed');
  const step = ESCALATION_LADDER[Math.min(offenses.length, ESCALATION_LADDER.length - 1)];
  return { offenses: offenses.length, ...step };
}