import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Settings, LogOut, Scale, FileText, LayoutDashboard, Crown, Shield, User } from 'lucide-react';
import { isOwner } from '@/lib/isOwner';
import { base44 } from '@/api/base44Client';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

const tierConfig = (user) => {
  if (isOwner(user)) return { label: 'Owner', icon: Crown, gradient: 'from-amber-400 to-orange-500', text: 'text-amber-300', ring: 'ring-amber-400/30' };
  if (user.role === 'staff') return { label: 'Staff', icon: Shield, gradient: 'from-violet-400 to-purple-500', text: 'text-violet-300', ring: 'ring-violet-400/30' };
  return { label: 'Member', icon: User, gradient: 'from-blue-400 to-cyan-500', text: 'text-cyan-300', ring: 'ring-cyan-400/30' };
};

const navItems = [
  { to: '/portal', label: 'Member Portal', icon: LayoutDashboard },
  { to: '/my-appeals', label: 'My Appeals', icon: Scale },
];

export default function AccountSwitcher({ user, open, onClose, onOpenSettings }) {
  if (!user) return null;

  const name = user.full_name || user.roblox_username || user.email;
  const initials = (name || '?').split(/[\s@._]+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
  const tier = tierConfig(user);
  const TierIcon = tier.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[8vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
              className="pointer-events-auto w-full max-w-sm rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header with gradient ring avatar */}
              <div className="relative px-6 pt-7 pb-5 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Avatar with Gemini-style gradient ring */}
                <div className="inline-block p-[3px] rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                  <div className="h-20 w-20 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                    {user.roblox_username ? (
                      <RobloxAvatar username={user.roblox_username} size={80} />
                    ) : (
                      <span className="text-2xl font-bold text-white">{initials}</span>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-white truncate">{name}</h3>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>

                {/* Subscription tier badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className={`h-4 w-4 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                    <TierIcon className="h-2.5 w-2.5 text-white" />
                  </span>
                  <span className={`text-xs font-medium ${tier.text}`}>{tier.label}</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="px-3 pb-2 space-y-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </Link>
                ))}
                {isOwner(user) && (
                  <Link
                    to="/manage-applications"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-slate-400" />
                    Manage Applications
                  </Link>
                )}
              </div>

              {/* Footer actions */}
              <div className="border-t border-white/10 px-3 py-2 space-y-0.5">
                <button
                  onClick={() => { onOpenSettings(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Settings
                </button>
                <button
                  onClick={() => base44.auth.logout('/')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}