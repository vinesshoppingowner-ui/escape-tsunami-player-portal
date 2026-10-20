import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import SiteNav from '@/components/SiteNav';
import ApplicationsTab from '@/components/admin/ApplicationsTab';

export default function ManageApplicationsPage() {
  const { user } = useAuth();
  const allowed = isOwner(user) || user?.role === 'staff';

  useEffect(() => {
    document.title = 'Manage Applications · Escape Tsunami';
  }, []);

  if (!allowed) return <Navigate to="/portal" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-20">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">
            <Shield className="h-3.5 w-3.5" /> Application Manager
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Manage Applications</h1>
          <p className="mt-1 text-sm text-slate-400">Create, edit, and review application forms and applicant submissions.</p>
        </div>
        <ApplicationsTab />
      </main>
    </div>
  );
}