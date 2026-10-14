import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs } from '@/lib/userPrefs';
import { isOwner } from '@/lib/isOwner';
import { getAdminRole, hasRoleChecked, markRoleChecked } from '@/lib/adminRole';

// Sends signed-in users to their chosen start page once per visit.
// Admins who haven't picked a role yet go to /role-select first.
export default function LandingRedirect() {
  const { user } = useAuth();
  const { landing_page } = useUserPrefs();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const VALID_LANDING_PAGES = ['/', '/portal', '/my-appeals'];
  useEffect(() => {
    if (!user || sessionStorage.getItem('et_landed')) return;
    sessionStorage.setItem('et_landed', '1');

    // Admins must choose a workspace role before proceeding
    if (isOwner(user) && !hasRoleChecked()) {
      const saved = getAdminRole();
      if (saved && pathname === '/') {
        markRoleChecked();
        navigate(saved === 'admin' ? '/admin' : '/teaching', { replace: true });
        return;
      }
      if (pathname === '/') {
        navigate('/role-select', { replace: true });
        return;
      }
    }

    if (pathname === '/' && landing_page && landing_page !== '/' && VALID_LANDING_PAGES.includes(landing_page)) {
      navigate(landing_page, { replace: true });
    }
  }, [user]);

  return null;
}