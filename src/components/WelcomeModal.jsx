import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Scale, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { useUserPrefs, WELCOME_FLAG } from '@/lib/userPrefs';

export default function WelcomeModal() {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || sessionStorage.getItem(WELCOME_FLAG) !== '1') return;
    sessionStorage.removeItem(WELCOME_FLAG);
    if (prefs.welcome_popup) setOpen(true);
  }, [user]);

  if (!user) return null;
  const staff = isOwner(user) || user.role === 'staff' || user.role === 'admin';
  const name = user.full_name || user.roblox_username || user.email?.split('@')[0];
  const links = [
    { to: '/portal', label: 'Member Portal', icon: LogIn },
    { to: '/my-appeals', label: 'My Appeals', icon: Scale },
    ...(staff ? [{ to: '/admin', label: 'Staff Console', icon: ShieldCheck }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden border-white/10 bg-slate-950 p-0 text-white">
        <div className="relative bg-gradient-to-b from-cyan-500/20 to-transparent px-6 pt-8 pb-4 text-center">
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40">
            <CheckCircle2 className="h-9 w-9 text-emerald-400" />
          </motion.div>
          <DialogTitle className="mt-4 font-display text-2xl font-bold">You're officially logged in!</DialogTitle>
          <p className="mt-1 text-sm text-slate-400">Welcome{name ? `, ${name}` : ''} — glad to have you back.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[11px]">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-300">{user.email}</span>
            {staff && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-amber-200">Staff</span>}
            <span className={`rounded-full border px-2.5 py-0.5 ${user.roblox_username ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-400'}`}>
              {user.roblox_username ? `Roblox: ${user.roblox_username}` : 'Roblox not linked'}
            </span>
          </div>
        </div>
        <div className="space-y-2 px-6 pb-6">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500"><Sparkles className="h-3.5 w-3.5" /> Jump right in</div>
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm hover:border-cyan-500/30 hover:bg-white/[0.06] transition-colors">
              <l.icon className="h-4 w-4 text-cyan-300" /> {l.label}
            </Link>
          ))}
          <button onClick={() => setOpen(false)} className="mt-2 w-full h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white">
            Let's go
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}