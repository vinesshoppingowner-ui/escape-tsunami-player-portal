import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, LogIn, Scale, ShieldCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import SettingsDialog from '@/components/profile/SettingsDialog';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

const itemCls = 'flex items-center gap-2.5 cursor-pointer px-2.5 py-2 rounded-md text-slate-300 focus:text-white focus:bg-white/5';

export default function ProfileMenu() {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!user) {
    return (
      <Link to="/login" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-slate-200 hover:text-white">
        <LogIn className="h-4 w-4" /> Log in
      </Link>
    );
  }

  const staff = isOwner(user) || user.role === 'staff' || user.role === 'admin';
  const name = user.full_name || user.roblox_username || user.email;
  const initials = (name || '?').split(/[\s@._]+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button aria-label="Open profile menu" className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white ring-2 ring-white/10 hover:ring-cyan-400/50 transition-all flex items-center justify-center">
            {user.roblox_username ? <RobloxAvatar username={user.roblox_username} size={36} /> : initials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 bg-slate-900/95 backdrop-blur-xl border-white/10 text-white p-1.5">
          <div className="px-2.5 py-2">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs text-slate-400 truncate">{user.email}</div>
            {staff && <span className="mt-1.5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">Staff</span>}
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem asChild className={itemCls}><Link to="/portal"><LogIn className="h-4 w-4" /> Member Portal</Link></DropdownMenuItem>
          <DropdownMenuItem asChild className={itemCls}><Link to="/my-appeals"><Scale className="h-4 w-4" /> My Appeals</Link></DropdownMenuItem>
          {staff && <DropdownMenuItem asChild className={itemCls}><Link to="/admin"><ShieldCheck className="h-4 w-4" /> Staff Console</Link></DropdownMenuItem>}
          <DropdownMenuItem className={itemCls} onSelect={() => setSettingsOpen(true)}><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className={`${itemCls} text-rose-300 focus:text-rose-200 focus:bg-rose-500/10`} onSelect={() => base44.auth.logout('/')}>
            <LogOut className="h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}