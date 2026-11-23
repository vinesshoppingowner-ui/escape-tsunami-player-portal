import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Scale, LogIn, Sparkles, ShieldCheck, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs, WELCOME_FLAG } from '@/lib/userPrefs';
import { base44 } from '@/api/base44Client';

const BROADCAST_VERSION = 'et_welcome_everyone_v3';

export default function WelcomeModal() {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    if (location.pathname.startsWith('/apply/')) return;

    const perUserKey = `${BROADCAST_VERSION}_${user.id}`;
    let justLoggedIn = false;
    let seenBroadcast = Boolean(user?.data?.[BROADCAST_VERSION]);

    try {
      if (sessionStorage.getItem(WELCOME_FLAG) === '1' || localStorage.getItem(WELCOME_FLAG) === '1') {
        justLoggedIn = true;
      }
      if (localStorage.getItem(perUserKey) === '1') {
        seenBroadcast = true;
      }
    } catch {}

    // Show to everyone (including already-logged-in members) who hasn't seen this welcome yet,
    // and on every fresh login when welcome_popup is enabled.
    if (!seenBroadcast || (justLoggedIn && prefs.welcome_popup !== false)) {
      try {
        sessionStorage.removeItem(WELCOME_FLAG);
        localStorage.removeItem(WELCOME_FLAG);
        localStorage.setItem(perUserKey, '1');
      } catch {}
      if (!user?.data?.[BROADCAST_VERSION]) {
        base44.auth.updateMe({ ...(user.data || {}), [BROADCAST_VERSION]: true }).catch(() => {});
      }
      setOpen(true);
    }
  }, [user, location.pathname, prefs.welcome_popup]);

  if (!user) return null;
  const robloxUsername = user.roblox_username || user.data?.roblox_username;
  const name =
    user.custom_display_name ||
    user.data?.custom_display_name ||
    robloxUsername ||
    user.full_name ||
    user.email?.split('@')[0];

  const links = [
    { to: '/portal', label: 'Member Portal', sub: 'Check your standing & moderation history', icon: LogIn },
    { to: '/my-appeals', label: 'My Appeals', sub: 'Submit or track an appeal with staff', icon: Scale },
    { to: '/applications', label: 'Applications', sub: 'Apply for open community & staff roles', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[120] max-w-md overflow-hidden border-white/10 bg-slate-950 p-0 text-white shadow-2xl">
        <div className="relative bg-gradient-to-b from-cyan-500/20 via-blue-600/10 to-transparent px-6 pt-8 pb-5 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40 shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="h-9 w-9 text-emerald-400" />
          </motion.div>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 px-3 py-0.5 text-[11px] font-semibold text-cyan-300">
            <Sparkles className="h-3 w-3" /> Official Escape Tsunami Portal
          </div>

          <DialogTitle className="mt-2.5 font-display text-2xl font-bold text-white">
            Welcome{name ? `, ${name}` : ''}!
          </DialogTitle>
          <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
            You're officially signed in to the Escape Tsunami for Developers Member Portal.
          </p>

          <div className="mt-3.5 flex flex-wrap justify-center gap-1.5 text-[11px]">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-300">
              {user.email}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 ${
                robloxUsername
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              {robloxUsername ? `Roblox: ${robloxUsername}` : 'Roblox not linked yet'}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 px-6 pb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Jump right in
          </div>

          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm hover:border-cyan-500/35 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <l.icon className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white leading-tight">{l.label}</div>
                <div className="text-[11px] text-slate-400 truncate">{l.sub}</div>
              </div>
            </Link>
          ))}

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-2.5 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              We don't look up or steal your private info. The only things we collect are your <strong className="text-white">Roblox username</strong> and <strong className="text-white">email</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            Let's go
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}