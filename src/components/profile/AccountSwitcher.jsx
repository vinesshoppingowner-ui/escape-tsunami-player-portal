import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, LogOut, Scale, FileText, LayoutDashboard, Crown, Shield, User, Pencil } from 'lucide-react';
import { isOwner } from '@/lib/isOwner';
import { base44 } from '@/api/base44Client';
import UserAvatar from '@/components/profile/UserAvatar';
import { RING_STYLE } from '@/components/profile/ProfileMenu';

const tierConfig = (user) => {
  if (isOwner(user)) return { label: 'Owner', icon: Crown, gradient: 'from-amber-400 to-orange-500', text: 'text-amber-300' };
  if (user.role === 'staff') return { label: 'Staff', icon: Shield, gradient: 'from-violet-400 to-purple-500', text: 'text-violet-300' };
  return { label: 'Member', icon: User, gradient: 'from-blue-400 to-cyan-500', text: 'text-cyan-300' };
};

const navItems = [
  { to: '/portal', label: 'Member Portal', icon: LayoutDashboard },
  { to: '/my-appeals', label: 'My Appeals', icon: Scale },
];

export default function AccountSwitcher({ user, open, onClose, onOpenSettings, anchorRef }) {
  const dropdownRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !anchorRef?.current?.contains(e.target)) onClose();
    };
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEsc); };
  }, [open, onClose]);

  if (!user) return null;

  const name = user.custom_display_name || user.data?.custom_display_name || user.full_name || user.roblox_username || user.email;
  const bio = user.bio || user.data?.bio || '';
  const tier = tierConfig(user);
  const TierIcon = tier.icon;

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: `${pos.top}px`, right: `${pos.right}px`, zIndex: 101 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
            className="w-72 rounded-xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-4 pt-4 pb-3">
              <button
                onClick={onClose}
                className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="shrink-0 p-[3px] rounded-full" style={RING_STYLE}>
                  <UserAvatar user={user} size={48} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  {user.roblox_username && (
                    <p className="text-[11px] text-cyan-300/90 truncate">@{user.roblox_username}</p>
                  )}
                </div>
              </div>

              {bio ? (
                <p className="mt-2.5 text-xs text-slate-300 bg-white/[0.03] border border-white/5 rounded-lg px-2.5 py-1.5 leading-snug line-clamp-2">
                  {bio}
                </p>
              ) : null}

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                  <span className={`h-3.5 w-3.5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                    <TierIcon className="h-2 w-2 text-white" />
                  </span>
                  <span className={`text-[11px] font-medium ${tier.text}`}>{tier.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { onOpenSettings('account'); onClose(); }}
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white"
                >
                  <Pencil className="h-3 w-3" /> Edit profile
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="px-1.5 pb-1.5 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5 text-slate-400" />
                  {item.label}
                </Link>
              ))}
              {isOwner(user) && (
                <Link
                  to="/manage-applications"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Manage Applications
                </Link>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-1.5 py-1.5 space-y-0.5">
              <button
                onClick={() => { onOpenSettings(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                Settings
              </button>
              <button
                onClick={() => base44.auth.logout('/')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}