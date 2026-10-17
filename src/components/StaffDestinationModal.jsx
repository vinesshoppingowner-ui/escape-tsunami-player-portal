import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setAdminRole, markRoleChecked, hasRoleChecked } from '@/lib/adminRole';
import { isOwner } from '@/lib/isOwner';
import { base44 } from '@/api/base44Client';
import { isObjectId } from '@/lib/applicationSlug';
import AppIcon from '@/components/apply/AppIcon';
import { Shield, Users, ArrowRight, LogOut, Home, FileText } from 'lucide-react';

const STAFF_URL = 'https://staff.escapetsunamifordevelopers.com/';

// Full-screen overlay shown to staff accounts who haven't picked a destination yet.
// Blocks access to everything until they choose — members portal, staff website, home, or the linked application.
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0c] p-4 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-3xl my-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-blue-500/20 mb-4 sm:mb-5">
            <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white px-2">
            Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'Staff'}
          </h1>
          <p className="mt-2 sm:mt-2.5 text-slate-400 text-sm sm:text-base">Choose where to go.</p>
        </div>

        {/* Direct Application Link card when visiting /apply/:id */}
        {applySlugOrId && (
          <button
            onClick={chooseApplication}
            className="group relative mb-3 sm:mb-4 w-full text-left rounded-2xl bg-gradient-to-r from-cyan-500/15 via-[#111827] to-blue-600/15 border border-cyan-500/40 p-5 sm:p-6 hover:border-cyan-400 hover:from-cyan-500/20 hover:to-blue-600/20 transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                  {linkedApp?.icon ? (
                    <AppIcon icon={linkedApp.icon} className="h-6 w-6 text-cyan-300" emojiClass="text-2xl" />
                  ) : (
                    <FileText className="h-5 w-5 text-cyan-300" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-cyan-300 uppercase tracking-widest font-semibold">Direct Application Link</p>
                  <h2 className="text-base sm:text-lg font-semibold text-white leading-tight truncate mt-0.5">
                    {linkedApp?.title || `Application (${applySlugOrId})`}
                  </h2>
                  {linkedApp?.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{linkedApp.description}</p>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 group-hover:gap-2.5 transition-all shrink-0">
                Continue to Application <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        )}

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Members Portal */}
          <button
            onClick={chooseMembers}
            className="group relative text-left rounded-2xl bg-[#111827] border border-[#1e293b] p-5 sm:p-6 hover:border-cyan-500/40 hover:bg-[#131c2e] transition-all duration-200 active:scale-[0.98] sm:active:scale-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#1e293b] border border-[#2a3a52] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Users className="h-5 w-5 text-cyan-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-white leading-tight">Members Portal</h2>
                <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold mt-0.5">Player Portal</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 sm:mb-5">
              View your moderation history, submit appeals, track applications, and manage your account standing.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 group-hover:gap-2.5 transition-all">
              Enter Members Portal <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>

          {/* Staff Portal */}
          <button
            onClick={chooseStaff}
            className="group relative text-left rounded-2xl bg-[#111827] border border-[#1e293b] p-5 sm:p-6 hover:border-amber-500/40 hover:bg-[#1c1810] transition-all duration-200 active:scale-[0.98] sm:active:scale-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#1e293b] border border-[#3a3520] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Shield className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-white leading-tight">Staff Portal</h2>
                <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold mt-0.5 truncate">staff.escapetsunamifordevelopers.com</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 sm:mb-5">
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
          className="group mt-3 w-full flex items-center justify-between rounded-2xl bg-[#111827] border border-[#1e293b] px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-[#161f2e] hover:border-white/10 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[#1e293b] border border-[#2a3a52] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Home className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-white">Go to Home Page</p>
              <p className="text-xs text-slate-500">Browse the public landing page</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Sign out */}
        <div className="mt-6 sm:mt-8 text-center">
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