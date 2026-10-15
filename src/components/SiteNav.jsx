import { Link, useLocation } from 'react-router-dom';
import SiteBrand from '@/components/SiteBrand';
import { LogIn, Menu, X, Home, Scale, AlertTriangle, Megaphone, FileText, ChevronDown, Bug, Play } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useDesktopApp } from '@/hooks/useDesktopApp';
import ProfileMenu from '@/components/profile/ProfileMenu';
import { useUserPrefs } from '@/lib/userPrefs';
import { useAutoHideNav } from '@/hooks/useAutoHideNav';

const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';

export default function SiteNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const navHidden = useAutoHideNav(prefs.auto_hide_nav);
  const isDesktopApp = useDesktopApp();
  const isDesktopLayout = isDesktopApp || new URLSearchParams(window.location.search).has('splash');
  const [siteSettings, setSiteSettings] = useState(null);
  const [topAnnouncement, setTopAnnouncement] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [settingsList, announcements] = await Promise.all([
          base44.entities.SiteSettings.list('-updated_date', 1),
          base44.entities.Announcement.list('-created_date', 20),
        ]);
        setSiteSettings(settingsList?.[0] || null);
        const now = Date.now();
        const active = (announcements || []).filter(
          (a) => a.active && (!a.expires_at || new Date(a.expires_at).getTime() > now)
        );
        const pinned = active.filter((a) => a.pinned);
        setTopAnnouncement(pinned[0] || active[0] || null);
      } catch {}
    })();
  }, [location.pathname]);

  const directLinks = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Portal', to: '/portal', icon: LogIn },
    { label: 'My Appeals', to: '/my-appeals', icon: Scale },
    { label: 'Applications', to: '/applications', icon: FileText },
    { label: 'Bug Reports', to: '/bug-reports', icon: Bug, comingSoon: true },
  ];
  const dropdownLinks = [];
  const mobileLinks = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Member Portal', to: '/portal', icon: LogIn },
    { label: 'My Appeals', to: '/my-appeals', icon: Scale },
    { label: 'Applications', to: '/applications', icon: FileText },
    { label: 'Bug Reports', to: '/bug-reports', icon: Bug, comingSoon: true },
  ];

  const BANNER_COLORS = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-200',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-200',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200',
  };

  const showEmergency = siteSettings?.emergency_alert_enabled && siteSettings?.emergency_alert_message;
  const showBanner = siteSettings?.banner_enabled && siteSettings?.banner_message && !bannerDismissed;
  const showAnnouncement = topAnnouncement && !announcementDismissed;
  const barOffset = (showEmergency ? 36 : 0) + (showBanner ? 40 : 0) + (showAnnouncement ? 40 : 0);

  return (
    <>
    <header className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-gradient-to-b from-[#0B0D13]/90 to-[#0B0D13]/60 border-b border-white/[0.08] transition-transform duration-300 ${navHidden && !open ? '-translate-y-full' : ''}`}>
      {showEmergency && (
        <div className="bg-rose-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{siteSettings.emergency_alert_message}</span>
        </div>
      )}
      {showBanner && (
        <div className={`relative px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 border-b ${BANNER_COLORS[siteSettings.banner_color] || BANNER_COLORS.cyan}`}>
          <Megaphone className="h-4 w-4 shrink-0" />
          <span className="truncate">{siteSettings.banner_message}</span>
          {siteSettings.banner_dismissible && (
            <button onClick={() => setBannerDismissed(true)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {showAnnouncement && (
        <div className="px-4 py-2 text-center text-sm flex items-center justify-center gap-2 bg-white/[0.03] border-b border-white/5 text-slate-300">
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 shrink-0">{topAnnouncement.type || 'info'}</span>
          <span className="font-medium text-white shrink-0">{topAnnouncement.title}:</span>
          <span className="truncate">{topAnnouncement.body}</span>
          <button onClick={() => setAnnouncementDismissed(true)} className="opacity-60 hover:opacity-100 ml-2 shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 md:h-16 flex items-center justify-between gap-4">
        <div className="shrink-0"><SiteBrand /></div>

        <nav className="hidden md:flex flex-1 justify-center items-center gap-0.5">
          {directLinks.map((l) => {
            const active = location.pathname === l.to;
            if (l.comingSoon) {
              return (
                <span
                  key={l.to}
                  className="relative px-3.5 py-2 text-sm font-medium rounded-lg inline-flex items-center gap-1.5 text-slate-600 cursor-not-allowed"
                  title="Coming soon"
                >
                  {l.icon && <l.icon className="h-3.5 w-3.5" />}
                  {l.label}
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30 leading-none">Soon</span>
                </span>
              );
            }
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-3.5 py-2 text-sm font-medium transition-all duration-150 rounded-lg inline-flex items-center gap-1.5 ${
                  active ? 'text-white bg-white/[0.08]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {l.icon && <l.icon className="h-3.5 w-3.5" />}
                {l.label}
                {active && <span className="absolute -bottom-[1px] left-3 right-3 h-0.5 bg-cyan-400 rounded-full" />}
              </Link>
            );
          })}


        </nav>

        <div className="hidden md:flex items-center justify-end gap-2 w-40">
          {!user && (
            <Link to="/login">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">Sign in</Button>
            </Link>
          )}
          <ProfileMenu />
        </div>

        <div className="md:hidden flex items-center gap-0.5">
          {!user && (
            <Link to="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium text-cyan-300 hover:bg-white/[0.06] transition-colors">
              Sign in
            </Link>
          )}
          <ProfileMenu />
          <button
            className="text-white p-2 rounded-lg hover:bg-white/[0.06] transition-colors active:scale-95"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`md:hidden overflow-hidden border-t border-white/[0.06] bg-[#0B0D13]/95 backdrop-blur-xl transition-all duration-300 ease-out ${
          open ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-4 space-y-1">
          {mobileLinks.map((l) => {
            const active = location.pathname === l.to;
            if (l.comingSoon) {
              return (
                <span
                  key={l.to}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-slate-600 cursor-not-allowed"
                >
                  {l.icon && <l.icon className="h-4.5 w-4.5 shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />}
                  {l.label}
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none border border-slate-600/30">Coming Soon</span>
                </span>
              );
            }
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                  active ? 'text-white bg-white/[0.08]' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {l.icon && <l.icon className="h-4.5 w-4.5 text-cyan-400/70 shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />}
                {l.label}
                {l.showNew && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold uppercase tracking-wider leading-none border border-cyan-500/30">New</span>
                )}
              </Link>
            );
          })}
          <a
            href={GAME_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 justify-center mt-2 px-3 py-3 rounded-xl text-white text-[15px] font-semibold bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            <Play className="h-4 w-4" /> Play on Roblox
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/25">FREE</span>
          </a>
          {!user && (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 justify-center px-3 py-3 rounded-xl text-white/90 text-[15px] font-medium border border-white/15 bg-white/5"
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
    {barOffset > 0 && <div style={{ height: `${barOffset}px` }} aria-hidden="true" />}
    </>
  );
}