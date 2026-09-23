export const APPEAL_STATUSES = ['Pending', 'Under Review', 'Approved', 'Denied'];

export const STATUS_STYLES = {
  'Pending': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Under Review': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Approved': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Denied': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

export const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

export const priorityFor = (mod) => {
  const t = mod?.moderation_type;
  if (t === 'Permanent Ban' || t === 'Temporary Ban') return { label: 'High', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
  if (t === 'Warning') return { label: 'Low', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  return { label: 'Medium', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
};