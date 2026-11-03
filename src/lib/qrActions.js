import { LogIn, LayoutGrid, FileText, Link2 } from 'lucide-react';

export const PORTAL_URL = 'https://tsunami-shield-portal.base44.app';

// Portal pages a staff-made QR can jump straight to.
export const PORTAL_PAGES = [
  { label: 'Member Portal', path: '/portal', hint: 'Standing overview' },
  { label: 'My Appeals', path: '/my-appeals', hint: 'Members sign in first' },
  { label: 'Applications', path: '/applications', hint: 'Open roles' },
  { label: 'Notifications', path: '/notifications', hint: 'Members sign in first' },
];

// The kinds of code this staff tool can produce.
export const QR_MODES = [
  { id: 'signin', label: 'Sign in', icon: LogIn, hint: 'Signs a member straight into their account.' },
  { id: 'portal', label: 'Portal page', icon: LayoutGrid, hint: 'Opens a portal page in one scan.' },
  { id: 'application', label: 'Application', icon: FileText, hint: 'Opens a specific application form.' },
  { id: 'link', label: 'Custom link', icon: Link2, hint: 'Discord, game page, or any URL.' },
];