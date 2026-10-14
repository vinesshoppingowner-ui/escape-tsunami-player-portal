import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setAdminRole, markRoleChecked, hasRoleChecked } from '@/lib/adminRole';
import { isOwner } from '@/lib/isOwner';
import { Shield, Users, Globe, ArrowRight, LogOut, Home } from 'lucide-react';

const STAFF_URL = 'https://staff.escapetsunamifordevelopers.com/';

// Full-screen overlay shown to staff accounts who haven't picked a destination yet.
// Blocks access to everything until they choose — members portal, staff website, or home.
export default function StaffDestinationModal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const shouldShow = user && isOwner(user) && !hasRoleChecked();

  const chooseMembers = () => {
    setAdminRole('members');
    markRoleChecked();
    navigate('/portal', { replace: true });
  };

  const chooseStaff = () => {
    setAdminRole('admin');
    markRoleChecked();
    window.location.href = STAFF_URL;
  };

  const chooseHome = () => {
    markRoleChecked();
    navigate('/', { replace: true });
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-5">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-5 shadow-lg shadow-cyan-500/10">
            <Shield className="h-8 w-8 text-cyan-300" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            Welcome back, {user?.full_name || user?.email || 'Staff'}
          </h1>
          <p className="mt-3 text-slate-400 text-lg">Choose where to go.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Members Portal */}
          <button
            onClick={chooseMembers}
            className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/[0.06] group-hover:to-blue-600/[0.04] transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Users className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Members Portal</h2>
                  <p className="text-xs text-cyan-300/70 uppercase tracking-wider font-semibold">Player Portal</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                View your moderation history, submit appeals, track applications, and manage your account standing.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 group-hover:gap-3 transition-all">
                Enter Members Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </button>

          {/* Staff Portal */}
          <button
            onClick={chooseStaff}
            className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/[0.06] group-hover:to-orange-600/[0.04] transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Staff Portal</h2>
                  <p className="text-xs text-amber-300/70 uppercase tracking-wider font-semibold">staff.escapetsunamifordevelopers.com</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                Manage applications, review appeals, issue moderations, and access staff tools and analytics.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 group-hover:gap-3 transition-all">
                Enter Staff Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </button>
        </div>

        {/* Home page option */}
        <button
          onClick={chooseHome}
          className="group mt-5 w-full flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/[0.06] px-6 py-4 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Home className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Go to Home Page</p>
              <p className="text-xs text-slate-500">Browse the public landing page</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => logout(true)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}