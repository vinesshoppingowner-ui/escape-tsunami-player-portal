import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setAdminRole, markRoleChecked, hasRoleChecked } from '@/lib/adminRole';
import { isOwner } from '@/lib/isOwner';
import { base44 } from '@/api/base44Client';
import { isObjectId } from '@/lib/applicationSlug';
import AppIcon from '@/components/apply/AppIcon';
import UserAvatar from '@/components/profile/UserAvatar';
import { 
  Shield, 
  Users, 
  ArrowRight, 
  ExternalLink, 
  LogOut, 
  Home, 
  FileText 
} from 'lucide-react';

const STAFF_URL = 'https://staff.escapetsunamifordevelopers.com/';

export default function StaffDestinationModal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [linkedApp, setLinkedApp] = useState(null);

  const shouldShow = user && isOwner(user) && !hasRoleChecked();
  const applyMatch = location.pathname.match(/^\/apply\/([^/?#]+)/);
  const applySlugOrId = applyMatch ? decodeURIComponent(applyMatch[1]) : null;

  useEffect(() => {
    let active = true;
    if (!shouldShow || !applySlugOrId) {
      setLinkedApp(null);
      return;
    }
    (async () => {
      try {
        let a = null;
        if (!isObjectId(applySlugOrId)) {
          const slugPage = await base44.entities.Application.filter({ slug: applySlugOrId }, { limit: 1 });
          a = slugPage?.items?.[0] || null;
        }
        if (!a) a = await base44.entities.Application.get(applySlugOrId);
        if (active) setLinkedApp(a || null);
      } catch {
        if (active) setLinkedApp(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [shouldShow, applySlugOrId]);

  const chooseApplication = () => {
    setAdminRole('members');
    markRoleChecked();
  };

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

  const displayName = user?.full_name || user?.display_name || user?.username || user?.email?.split('@')[0] || 'Staff Member';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07090e] p-4 sm:p-6 overflow-y-auto">
      {/* Ambient background depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-amber-600/10 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-2xl my-auto">
        {/* Centered Avatar and User Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3.5">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl ring-1 ring-white/10 p-1 bg-white/[0.02] backdrop-blur-md shadow-xl flex items-center justify-center">
              {user?.avatar_url ? (
                <UserAvatar user={user} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <div className="h-full w-full rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-300 font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Anchored bottom-right online dot */}
            <span className="absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#07090e] ring-2 ring-[#07090e]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white px-2">
            Welcome back, {displayName}
          </h1>

          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300">
            <Shield className="h-3 w-3 text-cyan-400" strokeWidth={2} />
            <span className="font-medium">Staff Account</span>
          </div>

          <p className="mt-2 text-slate-400 text-sm">
            Choose where to go.
          </p>
        </div>

        {/* Direct Application Card (When viewing /apply/:id) */}
        {applySlugOrId && (
          <button
            type="button"
            onClick={chooseApplication}
            className="group relative mb-4 w-full text-left rounded-xl bg-[#0f172a]/70 border border-cyan-500/30 p-4 sm:p-5 hover:border-cyan-400 hover:bg-[#131e38] transition-all duration-150 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  {linkedApp?.icon ? (
                    <AppIcon icon={linkedApp.icon} className="h-5 w-5 text-cyan-300" emojiClass="text-xl" />
                  ) : (
                    <FileText className="h-5 w-5 text-cyan-300" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-cyan-300 uppercase tracking-wider font-medium">Direct Link</p>
                  <h2 className="text-sm sm:text-base font-semibold text-white leading-tight truncate">
                    {linkedApp?.title || `Application (${applySlugOrId})`}
                  </h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-300 group-hover:gap-2 transition-all shrink-0">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        )}

        {/* Main Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Members Portal */}
          <button
            type="button"
            onClick={chooseMembers}
            className="group relative flex flex-col justify-between text-left rounded-xl bg-[#0c121e] border border-white/10 p-5 sm:p-6 hover:border-cyan-500/40 hover:bg-[#0f1726] hover:scale-[1.01] transition-all duration-150 active:scale-[0.99]"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 shrink-0">
                <Users className="h-5 w-5 text-cyan-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Members Portal</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                View your moderation history, submit appeals, track applications, and manage your account standing.
              </p>
            </div>

            <div className="mt-6 pt-3.5 border-t border-white/5">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-400 group-hover:gap-2 transition-all">
                Enter Members Portal <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>

          {/* Staff Portal */}
          <button
            type="button"
            onClick={chooseStaff}
            className="group relative flex flex-col justify-between text-left rounded-xl bg-[#14120e] border border-white/10 p-5 sm:p-6 hover:border-amber-500/40 hover:bg-[#191612] hover:scale-[1.01] transition-all duration-150 active:scale-[0.99]"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shrink-0">
                <Shield className="h-5 w-5 text-amber-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Staff Portal</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Manage applications, review appeals, issue moderations, and access staff tools and analytics.
              </p>
            </div>

            <div className="mt-6 pt-3.5 border-t border-white/5">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-400 group-hover:gap-2 transition-all">
                Launch Staff Dashboard <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        </div>

        {/* Minimal Footer Actions */}
        <div className="mt-7 flex items-center justify-center gap-5 text-xs sm:text-sm">
          <button
            type="button"
            onClick={chooseHome}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-md hover:bg-white/[0.04]"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to Main Website</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            type="button"
            onClick={() => logout(true)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors py-1 px-2.5 rounded-md hover:bg-rose-500/[0.05]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}