import { useEffect } from 'react';

// Redirects anyone visiting the staff subdomain back to the main domain.
export default function StaffSubdomainRedirect() {
  useEffect(() => {
    const host = window.location.hostname;
    if (host.startsWith('staff.')) {
      const mainHost = host.replace(/^staff\./, '');
      window.location.href = `https://${mainHost}${window.location.pathname}${window.location.search}`;
    }
  }, []);

  return null;
}