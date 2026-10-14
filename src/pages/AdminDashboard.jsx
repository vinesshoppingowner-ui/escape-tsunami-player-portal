import { Navigate } from 'react-router-dom';

// Admins land here after choosing "Admin" from the role-select hub.
// Redirects to the existing admin workspace.
export default function AdminDashboard() {
  return <Navigate to="/manage-applications" replace />;
}