import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setAdminRole, markRoleChecked } from '@/lib/adminRole';
import { Shield, GraduationCap, ArrowRight, LogOut } from 'lucide-react';
import SiteNav from '@/components/SiteNav';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const choose = (role) => {
    setAdminRole(role);
    markRoleChecked();
    navigate(role === 'admin' ? '/admin' : '/portal', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-3xl mx-auto px-5 pt-28 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 mb-5">
            <Shield className="h-8 w-8 text-cyan-300" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back, {user?.full_name || user?.email || 'Admin'}</h1>
          <p className="mt-3 text-slate-400 text-lg">Choose your workspace to continue.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Teaching Card */}
          <button
            onClick={() => choose('teaching')}
            className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Members Portal</h2>
                <p className="text-xs text-cyan-300/70 uppercase tracking-wider font-semibold">Member Portal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              View your moderation history, submit appeals, track applications, and manage your account standing.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 group-hover:gap-2.5 transition-all">
              Enter Members Portal <ArrowRight className="h-4 w-4" />
            </span>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => choose('admin')}
            className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-amber-500/40 hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Admin</h2>
                <p className="text-xs text-amber-300/70 uppercase tracking-wider font-semibold">Staff Dashboard</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Manage applications, review appeals, issue moderations, and access staff tools and analytics.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 group-hover:gap-2.5 transition-all">
              Enter Admin <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => logout(true)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}