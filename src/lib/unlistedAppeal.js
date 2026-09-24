export const UNLISTED_ID = 'unlisted';

// Builds a stand-in moderation for appeals about punishments that aren't on record.
export function unlistedModeration(appeal) {
  if (appeal?.moderation_id !== UNLISTED_ID) return undefined;
  return {
    unlisted: true,
    moderation_type: `${appeal.unlisted_type || 'Punishment'} (not listed)`,
    reason: appeal.unlisted_reason || 'Not on record',
    moderation_date: appeal.unlisted_date,
    status: 'Active',
  };
}