import { base44 } from '@/api/base44Client';

// When the current ban started: newest IP ban on this device's IP, or the account ban date.
export async function getBanStart(user) {
  const ip = await fetch('https://api.ipify.org?format=json').then((r) => r.json()).then((d) => d.ip).catch(() => null);
  const page = ip ? await base44.entities.IpBan.filter({ ip_address: ip }, { sort: '-created_date', limit: 1 }) : { items: [] };
  const dates = [page.items?.[0]?.created_date, user?.data?.banned_at].filter(Boolean).map((d) => new Date(d).getTime());
  return dates.length ? Math.max(...dates) : 0;
}

// An approved appeal only counts if it was decided after the current ban started.
export const appealCoversBan = (appeal, banStart) =>
  appeal?.status === 'Approved' && new Date(appeal.decided_at || appeal.updated_date).getTime() > banStart;