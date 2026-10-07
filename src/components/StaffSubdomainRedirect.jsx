import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Sends visitors on the staff subdomain (staff.escapetsunamifordevelopers.com) to the admin console.
export default function StaffSubdomainRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const host = window.location.hostname;
    const path = window.location.pathname;
    // Staff subdomain root → admin console
    if (host.startsWith('staff.') && path === '/') {
      navigate('/admin', { replace: true });
      return;
    }
    // Main domain /admin → bounce to staff subdomain so the main domain stays clean
    if (!host.startsWith('staff.') && path === '/admin') {
      const staffUrl = `https://staff.${host.replace(/^www\./, '')}${window.location.search}`;
      window.location.href = staffUrl;
    }
  }, []);

  return null;
}