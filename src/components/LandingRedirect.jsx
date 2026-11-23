import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs } from '@/lib/userPrefs';

// Sends signed-in users to their chosen start page once per visit.
// Staff destination selection is handled by StaffDestinationModal overlay.
export default function LandingRedirect() {
  const { user } = useAuth();
  const { landing_page } = useUserPrefs();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const VALID_LANDING_PAGES = ['/', '/portal', '/my-appeals'];
  useEffect(() => {
    if (!user) return;
    try {
      if (sessionStorage.getItem('et_landed')) return;
      sessionStorage.setItem('et_landed', '1');
    } catch {
      return;
    }

    if (pathname === '/' && landing_page && landing_page !== '/' && VALID_LANDING_PAGES.includes(landing_page)) {
      navigate(landing_page, { replace: true });
    }
  }, [user]);

  return null;
}