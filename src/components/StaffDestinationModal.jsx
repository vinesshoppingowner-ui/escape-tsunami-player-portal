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
  FileText,
  Sparkles
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
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-amber-600/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-3xl my-auto">
        {/* Header with User Identity */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ring-2 ring-white/10 p-1 bg-white/[0.03] backdrop-blur-md shadow-2xl flex items-center justify-center">
              {user?.avatar_url ? (
                <UserAvatar user={user} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <div className="h-full w-full rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-300 font-bold text-xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#07090e] ring-2 ring-[#07090e]">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-300 mb-3">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Staff Account Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white px-2">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Choose your workspace to begin.
          </p>
        </div>

        {/* Direct Application Stepper Card (Conditional) */}
        {applySlugOrId && (
          <button
            type="button"
            onClick={chooseApplication}
            className="group relative mb-4 w-full text-left rounded-2xl bg-[#0f172a]/80 backdrop-blur-md border border-cyan-500/40 p-5 sm:p-6 hover:border-cyan-400 hover:bg-[#131e38] transition-all duration-200 active:scale-[0.99] shadow-lg shadow-cyan-950/20"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                  {linkedApp?.icon ? (
                    <AppIcon icon={linkedApp.icon} className="h-6 w-6 text-cyan-300" emojiClass="text-2xl" />
                  ) : (
                    <FileText className="h-5 w-5 text-cyan-300" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-cyan-300 uppercase tracking-widest font-semibold">Direct Link Detected</p>
                  <h2 className="text-base sm:text-lg font-semibold text-white leading-tight truncate mt-0.5">
                    {linkedApp?.title || `Application (${applySlugOrId})`}
                  </h2>
                  {linkedApp?.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{linkedApp.description}</p>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 group-hover:gap-2.5 transition-all shrink-0">
                Continue <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        )}

        {/* Primary Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Members Portal */}
          <button
            type="button"
            onClick={chooseMembers}
            className="group relative flex flex-col justify-between text-left rounded-2xl bg-[#0c121e]/90 backdrop-blur-md border border-white/10 p-6 sm:p-7 hover:border-cyan-500/50 hover:bg-[#10192b] hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] shadow-xl shadow-cyan-950/10"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all duration-200 shrink-0">
                  <Users className="h-6 w-6 text-cyan-400" strokeWidth={1.75} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Player Workspace
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Members Portal</h2>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                View your personal account standing, manage appeals, claim community rewards, and check applications.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 group-hover:gap-2 transition-all">
                Enter Portal <ArrowRight className="h-4 w-4" />
              </span>
              <span className="text-xs text-slate-500">Internal</span>
            </div>
          </button>

          {/* Staff Portal */}
          <button
            type="button"
            onClick={chooseStaff}
            className="group relative flex flex-col justify-between text-left rounded-2xl bg-[#14120e]/90 backdrop-blur-md border border-white/10 p-6 sm:p-7 hover:border-amber-500/50 hover:bg-[#1a1712] hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] shadow-xl shadow-amber-950/10"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-500/20 transition-all duration-200 shrink-0">
                  <Shield className="h-6 w-6 text-amber-400" strokeWidth={1.75} />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Internal Workspace
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Staff Portal</h2>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review candidate applications, manage disciplinary appeals, view live audits, and open admin tools.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:gap-2 transition-all">
                Launch Staff Dashboard <ExternalLink className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs text-slate-500">External</span>
            </div>
          </button>
        </div>

        {/* Secondary Navigation Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <button
            type="button"
            onClick={chooseHome}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-white/[0.04]"
          >
            <Home className="h-3.5 w-3.5 text-slate-400" />
            <span>Return to Main Website</span>
          </button>

          <span className="hidden sm:inline-block text-slate-700">•</span>

          <button
            type="button"
            onClick={() => logout(true)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-rose-500/[0.05]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}