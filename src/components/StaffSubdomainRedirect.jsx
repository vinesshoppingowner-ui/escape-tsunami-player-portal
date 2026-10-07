import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Sends visitors on the staff subdomain (staff.escapetsunamifordevelopers.com) to the admin console.
export default function StaffSubdomainRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const host = window.location.hostname;
    if (host.startsWith('staff.') && window.location.pathname === '/') {
      navigate('/admin', { replace: true });
    }
  }, []);

  return null;
}