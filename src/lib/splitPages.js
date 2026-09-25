import { isOwner } from '@/lib/isOwner';

// Pages that can be opened in each side of Split View.
export function getSplitPages(user) {
  const staff = isOwner(user) || user?.role === 'staff' || user?.role === 'admin';
  const owner = isOwner(user);
  return [
    { value: '/', label: 'Home' },
    { value: '/portal', label: 'Member Portal' },
    { value: '/my-appeals', label: 'My Appeals' },
    { value: '/applications', label: 'Applications' },
    ...(staff ? [
      { value: '/admin?tab=appeals', label: 'Staff · Appeals' },
      { value: '/admin?tab=moderations', label: 'Staff · Moderations' },
      { value: '/admin?tab=lookup', label: 'Staff · User Lookup' },
      { value: '/admin?tab=livechat', label: 'Staff · Live Chat' },
    ] : []),
    ...(owner ? [
      { value: '/admin?tab=players', label: 'Admin · Player Profiles' },
      { value: '/admin?tab=logs', label: 'Admin · Staff Logs' },
      { value: '/admin?tab=watchlist', label: 'Admin · Watchlist' },
      { value: '/admin?tab=applications', label: 'Admin · Applications' },
      { value: '/admin?tab=reports', label: 'Admin · Reports' },
      { value: '/admin?tab=users', label: 'Admin · Users' },
      { value: '/analytics', label: 'Analytics' },
      { value: '/dashboard', label: 'Dashboard' },
    ] : []),
  ];
}