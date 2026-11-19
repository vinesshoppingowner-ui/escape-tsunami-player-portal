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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  Users,
  ArrowRight,
  LogOut,
  Home,
  FileText,
  ChevronDown,
} from 'lucide-react';

const STAFF_URL = 'https://staff.escapetsunamifordevelopers.com/';

function BrandWaveLogo({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 40 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="destLogoGrad1" x1="0" y1="0" x2="40" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="destLogoGrad2" x1="0" y1="32" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path
        d="M4 26V8.5C4 5.8 7.3 4.5 9.1 6.5L20 18.2L30.9 6.5C32.7 4.5 36 5.8 36 8.5V26"
        stroke="url(#destLogoGrad1)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 26V14L13 23"
        stroke="url(#destLogoGrad2)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

export default function StaffDestinationModal({ forceOpen = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [linkedApp, setLinkedApp] = useState(null);
  const [roleChecked, setRoleChecked] = useState(() => hasRoleChecked());

  const applyMatch = location.pathname.match(/^\/apply\/([^/?#]+)/);
  const applySlugOrId = applyMatch ? decodeURIComponent(applyMatch[1]) : null;
  const shouldShow = forceOpen || Boolean(user && isOwner(user) && !roleChecked && !hasRoleChecked());

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
    setRoleChecked(true);
    if (applySlugOrId) {
      navigate(`/apply/${encodeURIComponent(applySlugOrId)}${location.search || ''}`, { replace: true });
    }
  };

  const chooseMembers = () => {
    setAdminRole('members');
    markRoleChecked();
    setRoleChecked(true);
    navigate('/portal', { replace: true });
  };

  const chooseStaff = () => {
    setAdminRole('admin');
    markRoleChecked();
    setRoleChecked(true);
    window.location.href = STAFF_URL;
  };

  const chooseHome = () => {
    markRoleChecked();
    setRoleChecked(true);
    navigate('/', { replace: true });
  };

  if (!shouldShow) return null;

  const displayName =
    user?.roblox_username ||
    user?.data?.roblox_username ||
    user?.full_name ||
    user?.display_name ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'Staff Member';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#040711] text-white overflow-y-auto select-none">
      {/* Subtle curved wave background shapes matching reference */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-[480px] sm:w-[640px] h-auto text-[#091226] opacity-90"
          viewBox="0 0 640 360"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 0H460C410 130 330 165 210 195C90 225 35 280 0 360V0Z" fill="currentColor" />
        </svg>
        <svg
          className="absolute bottom-0 right-0 w-[440px] sm:w-[580px] h-auto text-[#091226] opacity-90"
          viewBox="0 0 580 320"
          fill="none"
          aria-hidden="true"
        >
          <path d="M580 320H120C185 215 280 185 390 140C485 100 545 50 580 0V320Z" fill="currentColor" />
        </svg>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[360px] w-[620px] rounded-full bg-blue-600/[0.06] blur-[130px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full h-16 px-5 sm:px-10 flex items-center justify-between border-b border-white/[0.06] bg-[#040711]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <BrandWaveLogo className="h-6 w-7 shrink-0" />
          <span className="text-sm sm:text-[15px] font-semibold tracking-tight text-white truncate">
            {displayName}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full p-1 pr-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-colors focus:outline-none"
              aria-label="Account menu"
            >
              {user?.avatar_url ? (
                <UserAvatar user={user} size={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="h-7 w-7 rounded-full bg-[#131926] border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                  {initial}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#0b101d] border-white/10 text-slate-200">
            <DropdownMenuItem onClick={chooseMembers} className="cursor-pointer focus:bg-white/[0.06] focus:text-white">
              <Users className="h-4 w-4 mr-2 text-[#38bdf8]" /> Members Portal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={chooseStaff} className="cursor-pointer focus:bg-white/[0.06] focus:text-white">
              <Shield className="h-4 w-4 mr-2 text-slate-300" /> Staff Portal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={chooseHome} className="cursor-pointer focus:bg-white/[0.06] focus:text-white">
              <Home className="h-4 w-4 mr-2 text-slate-400" /> Main Website
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => logout(true)}
              className="cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-[760px] flex flex-col items-center">
          {/* Center App Icon Box */}
          <div className="h-16 w-16 rounded-2xl bg-[#090d19] border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-center mb-6">
            <BrandWaveLogo className="h-8 w-9" />
          </div>

          {/* Welcome Heading */}
          <h1 className="text-center font-display text-2xl sm:text-[34px] font-bold tracking-tight text-white leading-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-[#56a8ff] to-[#3b82f6] bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>

          <p className="mt-2.5 text-center text-sm sm:text-[15px] text-slate-400">
            Choose where you’d like to go.
          </p>

          {/* Direct Application Banner (when deep-linked to /apply/:id) */}
          {applySlugOrId && (
            <button
              type="button"
              onClick={chooseApplication}
              className="group relative mt-7 w-full text-left rounded-2xl bg-[#09152b]/90 border border-[#1e3f7a]/70 p-4 sm:p-5 hover:border-[#38bdf8]/60 transition-all duration-150"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-[#0d2142] border border-[#234887]/60 flex items-center justify-center shrink-0">
                    {linkedApp?.icon ? (
                      <AppIcon icon={linkedApp.icon} className="h-5 w-5 text-[#38bdf8]" emojiClass="text-xl" />
                    ) : (
                      <FileText className="h-5 w-5 text-[#38bdf8]" strokeWidth={1.75} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#38bdf8] uppercase tracking-wider font-semibold">Direct Link</p>
                    <h2 className="text-sm sm:text-base font-semibold text-white leading-tight truncate">
                      {linkedApp?.title || `Application (${applySlugOrId})`}
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#38bdf8] group-hover:gap-2 transition-all shrink-0">
                  Continue <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          )}

          {/* Two Portal Destination Cards */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            {/* Members Portal Card */}
            <button
              type="button"
              onClick={chooseMembers}
              className="group relative flex flex-col justify-between text-left rounded-2xl bg-gradient-to-b from-[#09152b]/95 to-[#060d1b]/95 border border-[#1b3668]/80 hover:border-[#38bdf8]/60 p-6 sm:p-7 shadow-[0_18px_45px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(56,189,248,0.1)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-[#0d1f3d] border border-[#1e3f7a]/60 flex items-center justify-center mb-5 shrink-0">
                  <Users className="h-5 w-5 text-[#38bdf8]" strokeWidth={1.85} />
                </div>
                <h2 className="text-lg sm:text-[19px] font-bold text-white tracking-tight">
                  Members Portal
                </h2>
                <p className="mt-2.5 text-[13.5px] sm:text-sm text-slate-400 leading-relaxed">
                  View your moderation history, submit appeals, track applications, and manage your account standing.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1b3668]/45">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#38bdf8] group-hover:gap-2.5 transition-all">
                  Enter Members Portal <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>

            {/* Staff Portal Card */}
            <button
              type="button"
              onClick={chooseStaff}
              className="group relative flex flex-col justify-between text-left rounded-2xl bg-gradient-to-b from-[#0e121b]/95 to-[#090c13]/95 border border-white/[0.08] hover:border-white/20 p-6 sm:p-7 shadow-[0_18px_45px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 shrink-0">
                  <Shield className="h-5 w-5 text-slate-200" strokeWidth={1.85} />
                </div>
                <h2 className="text-lg sm:text-[19px] font-bold text-white tracking-tight">
                  Staff Portal
                </h2>
                <p className="mt-2.5 text-[13.5px] sm:text-sm text-slate-400 leading-relaxed">
                  Manage applications, review appeals, issue moderations, and access staff tools and analytics.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
                  Launch Staff Dashboard <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Footer Links with Side Dividers */}
          <div className="mt-11 w-full max-w-[640px] flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-[13px]">
            <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.07]" />

            <button
              type="button"
              onClick={chooseHome}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-white/[0.04]"
            >
              <Home className="h-3.5 w-3.5 text-slate-400" />
              <span>Return to Main Website</span>
            </button>

            <span className="h-4 w-px bg-white/10" aria-hidden="true" />

            <button
              type="button"
              onClick={() => logout(true)}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors py-1 px-2 rounded-md hover:bg-rose-500/[0.05]"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span>Sign out</span>
            </button>

            <div className="hidden sm:block h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.07]" />
          </div>
        </div>
      </main>
    </div>
  );
}