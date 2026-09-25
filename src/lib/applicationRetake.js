// Decides whether a user may (re)take an application, given their own responses (newest first).
export function getRetakeState(settings, mine) {
  if (!mine.length) return { canApply: true, attempt: 1 };
  const latest = mine[0];
  const attempt = mine.length + 1;
  if (latest.retake_allowed || !settings.oneResponsePerUser) return { canApply: true, attempt, latest };
  if (!settings.allowRetake || latest.status !== 'rejected') return { canApply: false, reason: 'applied', latest };
  if (settings.maxAttempts && mine.length >= settings.maxAttempts) return { canApply: false, reason: 'max', latest };
  const days = settings.retakeCooldownDays || 0;
  const availableAt = new Date(new Date(latest.reviewed_at || latest.updated_date).getTime() + days * 86400000);
  if (availableAt > new Date()) return { canApply: false, reason: 'cooldown', availableAt, latest };
  return { canApply: true, attempt, latest };
}