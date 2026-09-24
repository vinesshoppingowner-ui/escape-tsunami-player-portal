// Builds one row of performance stats per staff member from staff logs + appeals.
export function buildStaffStats(logs, appeals) {
  const rows = {};
  const row = (name) => (rows[name] ||= { name, decisions: 0, approved: 0, denied: 0, issued: 0, edits: 0, assigned: 0, resolved: 0, totalHours: 0, lastActive: null });

  logs.forEach((l) => {
    if (!l.staff_username || l.staff_username === 'Auto-expiry') return;
    const r = row(l.staff_username);
    if (l.action === 'appeal_decision') {
      r.decisions++;
      if (/Approved/.test(l.detail)) r.approved++;
      if (/Denied/.test(l.detail)) r.denied++;
    }
    if (l.action === 'moderation_issued') r.issued++;
    if (l.action === 'moderation_edited' || l.action === 'moderation_deleted') r.edits++;
    if (!r.lastActive || new Date(l.created_date) > new Date(r.lastActive)) r.lastActive = l.created_date;
  });

  appeals.forEach((a) => {
    if (!a.assigned_to) return;
    const r = row(a.assigned_to);
    r.assigned++;
    if (a.status === 'Approved' || a.status === 'Denied') {
      r.resolved++;
      r.totalHours += (new Date(a.updated_date) - new Date(a.created_date)) / 36e5;
    }
  });

  return Object.values(rows)
    .map((r) => ({ ...r, avgHours: r.resolved ? r.totalHours / r.resolved : null }))
    .sort((a, b) => b.decisions + b.issued - (a.decisions + a.issued));
}

export function formatHours(h) {
  if (h === null) return '—';
  return h < 1 ? `${Math.round(h * 60)}m` : h < 48 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
}