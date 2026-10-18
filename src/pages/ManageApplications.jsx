import ApplicationsTab from '@/components/admin/ApplicationsTab';
import SiteNav from '@/components/SiteNav';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { isOwner } from '@/lib/isOwner';

export default function ManageApplications() {
  const { user } = useAuth();
  const canManage = isOwner(user) || user?.role === 'staff';
  if (!canManage) return <Navigate to="/applications" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Manage Applications</h1>
            <p className="text-sm text-slate-400">Create, edit, configure settings, and review all application forms and submissions.</p>
          </div>
        </div>
        <ApplicationsTab />
      </main>
    </div>
  );
}