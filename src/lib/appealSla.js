export const SLA_WARNING_HOURS = 24;
export const SLA_OVERDUE_HOURS = 48;

// Returns null, or { level: 'warning' | 'overdue', hours } for open appeals waiting too long.
export function getSla(appeal) {
  if (appeal.status !== 'Pending' && appeal.status !== 'Under Review') return null;
  const hours = (Date.now() - new Date(appeal.created_date).getTime()) / 36e5;
  if (hours >= SLA_OVERDUE_HOURS) return { level: 'overdue', hours };
  if (hours >= SLA_WARNING_HOURS) return { level: 'warning', hours };
  return null;
}

export function slaCounts(appeals) {
  const counts = { overdue: 0, warning: 0 };
  appeals.forEach((a) => { const s = getSla(a); if (s) counts[s.level]++; });
  return counts;
}