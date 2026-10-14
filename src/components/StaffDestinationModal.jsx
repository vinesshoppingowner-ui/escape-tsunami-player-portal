import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setAdminRole, markRoleChecked, hasRoleChecked } from '@/lib/adminRole';
import { isOwner } from '@/lib/isOwner';
import { Shield, ArrowRight, LogOut } from 'lucide-react';

const STAFF_URL = 'https://staff.escapetsunamifordevelopers.com/';

// Full-screen overlay shown to staff accounts who haven't picked a destination yet.
// Blocks access to everything until they choose — they either go to the member portal
// or jump to the external staff website.
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

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-5">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 mb-5">
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
            className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Members Portal</h2>
                <p className="text-xs text-cyan-300/70 uppercase tracking-wider font-semibold">Player Portal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              View your moderation history, submit appeals, track applications, and manage your account standing.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 group-hover:gap-2.5 transition-all">
              Enter Members Portal <ArrowRight className="h-4 w-4" />
            </span>
          </button>

          {/* Staff Portal */}
          <button
            onClick={chooseStaff}
            className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-amber-500/40 hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Staff Portal</h2>
                <p className="text-xs text-amber-300/70 uppercase tracking-wider font-semibold">STAFF.ESCAPETSUNAMI.COM</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Manage applications, review appeals, issue moderations, and access staff tools and analytics.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 group-hover:gap-2.5 transition-all">
              Enter Staff Portal <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

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