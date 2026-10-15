import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setAdminRole, markRoleChecked, hasRoleChecked } from '@/lib/adminRole';
import { isOwner } from '@/lib/isOwner';
import { Shield, Users, ArrowRight, LogOut, Home } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0c] p-5">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 mb-5">
            <Shield className="h-7 w-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'Staff'}
          </h1>
          <p className="mt-2.5 text-slate-400 text-base">Choose where to go.</p>
        </div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Members Portal */}
          <button
            onClick={chooseMembers}
            className="group relative text-left rounded-2xl bg-[#111827] border border-[#1e293b] p-6 hover:border-cyan-500/40 hover:bg-[#131c2e] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-[#1e293b] border border-[#2a3a52] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Users className="h-5 w-5 text-cyan-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white leading-tight">Members Portal</h2>
                <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold mt-0.5">Player Portal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              View your moderation history, submit appeals, track applications, and manage your account standing.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 group-hover:gap-2.5 transition-all">
              Enter Members Portal <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>

          {/* Staff Portal */}
          <button
            onClick={chooseStaff}
            className="group relative text-left rounded-2xl bg-[#111827] border border-[#1e293b] p-6 hover:border-amber-500/40 hover:bg-[#1c1810] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-[#1e293b] border border-[#3a3520] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Shield className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white leading-tight">Staff Portal</h2>
                <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold mt-0.5 truncate max-w-[180px]">staff.escapetsunamifordevelopers.com</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Manage applications, review appeals, issue moderations, and access staff tools and analytics.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 group-hover:gap-2.5 transition-all">
              Enter Staff Portal <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>

        {/* Home page option */}
        <button
          onClick={chooseHome}
          className="group mt-3 w-full flex items-center justify-between rounded-2xl bg-[#111827] border border-[#1e293b] px-5 py-4 hover:bg-[#161f2e] hover:border-white/10 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#1e293b] border border-[#2a3a52] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Home className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Go to Home Page</p>
              <p className="text-xs text-slate-500">Browse the public landing page</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Sign out */}
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