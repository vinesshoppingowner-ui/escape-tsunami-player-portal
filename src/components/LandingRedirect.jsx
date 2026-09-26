import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs } from '@/lib/userPrefs';

// Sends signed-in users to their chosen start page once per visit.
export default function LandingRedirect() {
  const { user } = useAuth();
  const { landing_page } = useUserPrefs();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || sessionStorage.getItem('et_landed')) return;
    sessionStorage.setItem('et_landed', '1');
    if (pathname === '/' && landing_page && landing_page !== '/') navigate(landing_page, { replace: true });
  }, [user]);

  return null;
}