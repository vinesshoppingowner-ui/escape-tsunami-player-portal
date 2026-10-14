import { Navigate } from 'react-router-dom';

// Admins land here after choosing "Teaching" from the role-select hub.
// Redirects to the existing member portal.
export default function TeachingDashboard() {
  return <Navigate to="/portal" replace />;
}