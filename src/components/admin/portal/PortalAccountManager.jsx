import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Mail, Globe, Clock, Shield, AlertTriangle, User as UserIcon, Crown, Lock, Unlock, KeyRound, Ban, ShieldCheck, FileText, Users, Eye, MessageSquare, Flame, Send, StickyNote, ShieldBan } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { findUserByEmailOrUsername } from '@/lib/userLookup';
import PortalActions from './PortalActions';

function accountAge(createdDate) {
  if (!createdDate) return '—';
  const diff = Date.now() - new Date(createdDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 365) return `${days} day${days !== 1 ? 's' : ''}`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''}`;
}

export default function PortalAccountManager() {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [related, setRelated] = useState(null);
  const [error, setError] = useState(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setAccount(null);
    setRelated(null);
    try {
      const found = await findUserByEmailOrUsername(q);
      if (!found) {
        setError('No portal account found with that email or Roblox username.');
        return;
      }
      setAccount(found);
      const robloxUsername = found.roblox_username || found.data?.roblox_username;
      if (robloxUsername) {
        const [moderations, appeals, watchlist, notes, streak] = await Promise.all([
          base44.entities.Moderation.filter({ roblox_username: robloxUsername }, '-moderation_date', 50).catch(() => []),
          base44.entities.Appeal.filter({ roblox_username: robloxUsername }, '-created_date', 50).catch(() => []),
          base44.entities.WatchlistEntry.filter({ roblox_username: robloxUsername }, '-created_date', 10).catch(() => []),
          base44.entities.PlayerNote.filter({ roblox_username: robloxUsername }, '-created_date', 50).catch(() => []),
          base44.entities.UserStreak.filter({ roblox_username: robloxUsername }, '-created_date', 1).catch(() => []),
        ]);
        setRelated({ moderations, appeals, watchlist, notes, streak: streak[0] });
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const reloadAccount = async () => {
    if (!account) return;
    try {
      const users = await base44.entities.User.filter({ id: account.id }, '-created_date', 1);
      if (users.length > 0) setAccount(users[0]);
    } catch {}
  };

  const isAdmin = isOwner(currentUser);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Enter email or Roblox username…"
            className="bg-slate-950/60 border-white/15 text-white pl-9"
          />
        </div>
        <Button
          onClick={search}
          disabled={loading || !query.trim()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300 mb-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {account && (
        <div className="space-y-4">
          <AccountInfoCard account={account} currentUser={currentUser} />
          {isAdmin ? (
            <PortalActions account={account} related={related} currentUser={currentUser} onReload={reloadAccount} />
          ) : (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-300">
              Admin access required to manage portal accounts.
            </div>
          )}
        </div>
      )}

      {!loading && !account && !error && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-20 text-center text-slate-500">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Search by email or Roblox username to manage a portal account.</p>
        </div>
      )}
    </div>
  );
}

function AccountInfoCard({ account, currentUser }) {
  const robloxUsername = account.roblox_username || account.data?.roblox_username;
  const isBanned = account.banned || account.data?.banned;
  const googleLocked = account.google_locked || account.data?.google_locked;
  const forceReset = account.force_password_reset || account.data?.force_password_reset;
  const appealsLocked = account.appeals_locked || account.data?.appeals_locked;
  const isOwnerFlag = account.is_owner || account.data?.is_owner;
  const lastIp = account.last_ip || account.data?.last_ip;
  const lastSeen = account.last_seen || account.data?.last_seen;

  const badges = [
    isBanned && { label: 'Portal Banned', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
    googleLocked && { label: 'Google Locked', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
    forceReset && { label: 'Password Reset Required', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    appealsLocked && { label: 'Appeals Locked', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    isOwnerFlag && { label: 'Owner', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    account.role === 'staff' && { label: 'Staff', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    account.role === 'admin' && { label: 'Admin', cls: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  ].filter(Boolean);

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
          <UserIcon className="h-7 w-7 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{account.full_name || account.email?.split('@')[0]}</h3>
            {badges.map((b, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${b.cls}`}>{b.label}</span>
            ))}
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            <InfoRow icon={Mail} label="Email" value={account.email} />
            <InfoRow icon={UserIcon} label="Roblox" value={robloxUsername || 'Not linked'} />
            <InfoRow icon={Shield} label="Role" value={account.role || 'user'} />
            <InfoRow icon={Globe} label="Last IP" value={lastIp || '—'} mono />
            <InfoRow icon={Clock} label="Last Seen" value={lastSeen ? new Date(lastSeen).toLocaleString() : '—'} />
            <InfoRow icon={Clock} label="Account Age" value={accountAge(account.created_date)} />
          </div>
          {isBanned && (account.banned_reason || account.data?.banned_reason) && (
            <div className="mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-300">
              <strong>Ban reason:</strong> {account.banned_reason || account.data?.banned_reason}
              {(account.banned_by || account.data?.banned_by) && <span className="text-red-400/70"> · by {account.banned_by || account.data?.banned_by}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-950/40 border border-white/5 px-3 py-2">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
        <div className={`text-sm text-white truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
    </div>
  );
}