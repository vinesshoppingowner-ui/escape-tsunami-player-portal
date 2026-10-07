import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { logStaffAction } from '@/lib/staffLog';
import { isOwner } from '@/lib/isOwner';
import DeleteAccountButton from '@/components/admin/DeleteAccountButton';
import StaffPermissionsDialog from '@/components/admin/users/StaffPermissionsDialog';
import { Loader2, Ban, ShieldCheck, Lock, Unlock, KeyRound, ShieldBan, Crown, UserCog, UserMinus, ShieldAlert, UserCheck, Link2, Unlink, Gavel, Eye, EyeOff, Send, Mail, StickyNote, Flame, Trash2, Settings, MessageSquareOff, MessageSquare, LogOut, Download, Clock, MailCheck, MapPinOff, RefreshCw, ShieldX } from 'lucide-react';

function parseDuration(str) {
  if (!str) return 24 * 60 * 60 * 1000;
  const m = str.trim().match(/^(\d+)\s*(m|h|d|w)$/i);
  if (!m) return 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  return n * (unit === 'm' ? 60000 : unit === 'h' ? 3600000 : unit === 'd' ? 86400000 : 604800000);
}

const CATEGORIES = [
  {
    title: 'Account Control',
    actions: [
      { key: 'ban', icon: Ban, title: 'Ban from Portal', desc: 'Block all portal access', variant: 'danger', needsInput: 'ban' },
      { key: 'quickBan', icon: Ban, title: 'Quick Ban', desc: 'Instant ban with preset reason', variant: 'danger', needsInput: 'quickBan' },
      { key: 'unban', icon: ShieldCheck, title: 'Unban from Portal', desc: 'Restore portal access', variant: 'success' },
      { key: 'lockGoogle', icon: Lock, title: 'Lock Google Login', desc: 'Prevent Google OAuth login', variant: 'warning' },
      { key: 'unlockGoogle', icon: Unlock, title: 'Unlock Google Login', desc: 'Restore Google OAuth login', variant: 'success' },
      { key: 'forceReset', icon: KeyRound, title: 'Force Password Reset', desc: 'Require reset on next login', variant: 'warning' },
      { key: 'clearReset', icon: Unlock, title: 'Clear Password Reset', desc: 'Remove reset requirement', variant: 'success' },
      { key: 'lockAppeals', icon: Lock, title: 'Lock Appeals', desc: 'Block new appeal submissions', variant: 'warning' },
      { key: 'unlockAppeals', icon: Unlock, title: 'Unlock Appeals', desc: 'Allow new appeals', variant: 'success' },
    ],
  },
  {
    title: 'Role & Access',
    actions: [
      { key: 'promoteStaff', icon: UserCog, title: 'Promote to Staff', desc: 'Grant staff dashboard access', variant: 'default' },
      { key: 'demoteUser', icon: UserMinus, title: 'Demote to User', desc: 'Remove staff access', variant: 'default' },
      { key: 'promoteAdmin', icon: ShieldAlert, title: 'Promote to Admin', desc: 'Full admin access', variant: 'danger' },
      { key: 'toggleOwner', icon: Crown, title: 'Toggle Owner', desc: 'Switch owner status', variant: 'warning' },
    ],
  },
  {
    title: 'Security',
    actions: [
      { key: 'banIp', icon: ShieldBan, title: 'Ban IP Address', desc: 'Block their last known IP', variant: 'danger', needsInput: 'ip' },
      { key: 'permissions', icon: Settings, title: 'Manage Permissions', desc: 'Toggle individual staff powers', variant: 'default' },
      { key: 'deleteAccount', icon: Trash2, title: 'Delete Account', desc: 'Permanently remove portal account', variant: 'danger', custom: true },
    ],
  },
  {
    title: 'Verification',
    actions: [
      { key: 'verifyRoblox', icon: UserCheck, title: 'Admin Verify Roblox', desc: 'Force-verify Roblox account', variant: 'default' },
      { key: 'removeRoblox', icon: Unlink, title: 'Remove Roblox Link', desc: 'Clear Roblox username', variant: 'warning' },
    ],
  },
  {
    title: 'Moderation & Watchlist',
    actions: [
      { key: 'quickModerate', icon: Gavel, title: 'Quick Moderate', desc: 'Issue a moderation action', variant: 'default', needsInput: 'moderate' },
      { key: 'addWatchlist', icon: Eye, title: 'Add to Watchlist', desc: 'Flag player for monitoring', variant: 'warning', needsInput: 'watchlist' },
      { key: 'removeWatchlist', icon: EyeOff, title: 'Remove from Watchlist', desc: 'Stop monitoring', variant: 'success' },
    ],
  },
  {
    title: 'Communication',
    actions: [
      { key: 'sendNotification', icon: Send, title: 'Send Notification', desc: 'In-app notification', variant: 'default', needsInput: 'notification' },
      { key: 'sendEmail', icon: Mail, title: 'Send Email', desc: 'Direct email to user', variant: 'default', needsInput: 'email' },
    ],
  },
  {
    title: 'Notes & Streaks',
    actions: [
      { key: 'addNote', icon: StickyNote, title: 'Add Staff Note', desc: 'Private note on player', variant: 'default', needsInput: 'note' },
      { key: 'resetStreak', icon: Flame, title: 'Reset Daily Streak', desc: 'Clear streak progress', variant: 'warning' },
    ],
  },
  {
    title: 'Suspension & Mute',
    actions: [
      { key: 'suspend', icon: Ban, title: 'Suspend Account', desc: 'Block portal activity', variant: 'danger', needsInput: 'suspend' },
      { key: 'unsuspend', icon: ShieldCheck, title: 'Unsuspend Account', desc: 'Restore full access', variant: 'success' },
      { key: 'mute', icon: MessageSquareOff, title: 'Mute Chat', desc: 'Block appeal chat messages', variant: 'warning', needsInput: 'mute' },
      { key: 'unmute', icon: MessageSquare, title: 'Unmute Chat', desc: 'Allow appeal chat messages', variant: 'success' },
    ],
  },
  {
    title: 'Account Data',
    actions: [
      { key: 'clearSessions', icon: LogOut, title: 'Clear Sessions', desc: 'Force re-login on all devices', variant: 'warning' },
      { key: 'exportData', icon: Download, title: 'Export Account Data', desc: 'Download all user data', variant: 'default' },
      { key: 'setPrivateNote', icon: StickyNote, title: 'Set Private Note', desc: 'Admin-only account note', variant: 'default', needsInput: 'privateNote' },
      { key: 'clearPrivateNote', icon: Trash2, title: 'Clear Private Note', desc: 'Remove admin note', variant: 'default' },
    ],
  },
  {
    title: 'Advanced Controls',
    actions: [
      { key: 'tempBan', icon: Clock, title: 'Temporary Ban', desc: 'Ban with expiry date', variant: 'danger', needsInput: 'tempBan' },
      { key: 'resetLoginAttempts', icon: RefreshCw, title: 'Reset Login Attempts', desc: 'Clear failed login counter', variant: 'default' },
      { key: 'sendPasswordReset', icon: MailCheck, title: 'Send Password Reset', desc: 'Email a reset link', variant: 'default' },
      { key: 'clearRobloxVerify', icon: ShieldX, title: 'Clear Roblox Verify', desc: 'Remove verification status', variant: 'warning' },
      { key: 'resetTracking', icon: MapPinOff, title: 'Reset IP Tracking', desc: 'Clear last IP and seen', variant: 'default' },
    ],
  },
];

export default function PortalActions({ account, related, currentUser, onReload }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [showPerms, setShowPerms] = useState(false);
  const [inputValues, setInputValues] = useState({});

  const robloxUsername = account.roblox_username || account.data?.roblox_username;
  const isBanned = account.banned || account.data?.banned;
  const googleLocked = account.google_locked || account.data?.google_locked;
  const forceReset = account.force_password_reset || account.data?.force_password_reset;
  const appealsLocked = account.appeals_locked || account.data?.appeals_locked;
  const isSelf = account.id === currentUser?.id;

  const isSuspended = account.suspended || account.data?.suspended;
  const isMuted = (() => {
    const until = account.muted_until || account.data?.muted_until;
    return until && new Date(until) > new Date();
  })();
  const hasPrivateNote = !!(account.staff_notes_private || account.data?.staff_notes_private);

  const isDisabled = (key) => {
    if (isSelf && ['ban', 'tempBan', 'deleteAccount', 'demoteUser', 'promoteStaff', 'toggleOwner', 'promoteAdmin', 'suspend'].includes(key)) return true;
    if (key === 'ban' && isBanned) return true;
    if (key === 'tempBan' && isBanned) return true;
    if (key === 'unban' && !isBanned) return true;
    if (key === 'lockGoogle' && googleLocked) return true;
    if (key === 'unlockGoogle' && !googleLocked) return true;
    if (key === 'forceReset' && forceReset) return true;
    if (key === 'clearReset' && !forceReset) return true;
    if (key === 'lockAppeals' && appealsLocked) return true;
    if (key === 'unlockAppeals' && !appealsLocked) return true;
    if (key === 'removeRoblox' && !robloxUsername) return true;
    if (key === 'verifyRoblox' && !robloxUsername) return true;
    if (key === 'banIp' && !(account.last_ip || account.data?.last_ip)) return true;
    if (key === 'quickModerate' && !robloxUsername) return true;
    if (key === 'addWatchlist' && !robloxUsername) return true;
    if (key === 'removeWatchlist' && !robloxUsername) return true;
    if (key === 'resetStreak' && !robloxUsername) return true;
    if (key === 'sendNotification' && !robloxUsername) return true;
    if (key === 'addNote' && !robloxUsername) return true;
    if (key === 'suspend' && isSuspended) return true;
    if (key === 'unsuspend' && !isSuspended) return true;
    if (key === 'mute' && isMuted) return true;
    if (key === 'unmute' && !isMuted) return true;
    if (key === 'clearPrivateNote' && !hasPrivateNote) return true;
    return false;
  };

  const updateUser = async (updates, actionLabel) => {
    setBusy(actionLabel);
    try {
      await base44.entities.User.update(account.id, updates);
      await logStaffAction(currentUser, 'user_role_changed', account.email, `${actionLabel}: ${account.email}`);
      toast({ title: `${actionLabel} successful` });
      await onReload();
    } catch (e) {
      toast({ title: `${actionLabel} failed`, description: e.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const handleClick = (action) => {
    if (action.custom) return; // handled by custom component
    if (action.key === 'permissions') { setShowPerms(true); return; }
    if (action.needsInput) {
      setDialog({ type: action.needsInput, action });
      setInputValues({});
      return;
    }
    executeAction(action.key);
  };

  const executeAction = async (key, input) => {
    const staffName = currentUser?.full_name || currentUser?.email || 'Admin';
    const ip = account.last_ip || account.data?.last_ip;

    const actions = {
      ban: () => updateUser({ banned: true, banned_reason: input?.reason || 'Banned via portal manager', banned_at: new Date().toISOString(), banned_by: staffName }, 'Portal ban'),
      quickBan: () => updateUser({ banned: true, banned_reason: input?.reason || 'Violation of website rules', banned_at: new Date().toISOString(), banned_by: staffName }, 'Quick ban'),
      unban: () => updateUser({ banned: false, banned_reason: null }, 'Portal unban'),
      lockGoogle: () => updateUser({ google_locked: true }, 'Google login locked'),
      unlockGoogle: () => updateUser({ google_locked: false }, 'Google login unlocked'),
      forceReset: () => updateUser({ force_password_reset: true }, 'Password reset forced'),
      clearReset: () => updateUser({ force_password_reset: false }, 'Password reset cleared'),
      lockAppeals: () => updateUser({ appeals_locked: true }, 'Appeals locked'),
      unlockAppeals: () => updateUser({ appeals_locked: false }, 'Appeals unlocked'),
      promoteStaff: () => updateUser({ role: 'staff' }, 'Promoted to staff'),
      demoteUser: () => updateUser({ role: 'user' }, 'Demoted to user'),
      promoteAdmin: () => updateUser({ role: 'admin' }, 'Promoted to admin'),
      toggleOwner: () => updateUser({ is_owner: !(account.is_owner || account.data?.is_owner) }, 'Owner status toggled'),
      verifyRoblox: async () => {
        setBusy('Admin verify');
        try {
          await base44.functions.invoke('adminVerifyRoblox', { username: robloxUsername });
          toast({ title: 'Roblox account verified' });
          await onReload();
        } catch (e) {
          toast({ title: 'Verification failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      removeRoblox: () => updateUser({ roblox_username: '' }, 'Roblox link removed'),
      banIp: async () => {
        setBusy('IP ban');
        try {
          await base44.entities.IpBan.create({ ip_address: ip, reason: input?.reason || `Banned via portal manager — ${robloxUsername || account.email}`, banned_by: staffName });
          toast({ title: 'IP banned', description: ip });
        } catch (e) {
          toast({ title: 'IP ban failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      quickModerate: async () => {
        setBusy('Quick moderate');
        try {
          await base44.entities.Moderation.create({
            roblox_username: robloxUsername,
            moderation_type: input?.type || 'Warning',
            reason: input?.reason || 'Issued via portal manager',
            details: input?.details || '',
            moderation_date: new Date().toISOString(),
            duration: input?.duration || '',
            staff_member: staffName,
            status: 'Active',
          });
          await logStaffAction(currentUser, 'moderation_issued', robloxUsername, `${input?.type || 'Warning'}: ${input?.reason || 'Issued via portal manager'}`);
          toast({ title: 'Moderation issued' });
        } catch (e) {
          toast({ title: 'Moderation failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      addWatchlist: async () => {
        setBusy('Add to watchlist');
        try {
          await base44.entities.WatchlistEntry.create({ roblox_username: robloxUsername, reason: input?.reason || 'Added via portal manager', level: input?.level || 'medium', added_by: staffName });
          toast({ title: 'Added to watchlist' });
          await onReload();
        } catch (e) {
          toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      removeWatchlist: async () => {
        setBusy('Remove from watchlist');
        try {
          await base44.entities.WatchlistEntry.deleteMany({ roblox_username: robloxUsername });
          toast({ title: 'Removed from watchlist' });
          await onReload();
        } catch (e) {
          toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      sendNotification: async () => {
        setBusy('Send notification');
        try {
          await base44.entities.Notification.create({ roblox_username: robloxUsername, title: input?.title || 'Staff Message', body: input?.body || '', type: 'staff_message' });
          toast({ title: 'Notification sent' });
        } catch (e) {
          toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      sendEmail: async () => {
        setBusy('Send email');
        try {
          await base44.integrations.Core.SendEmail({ to: account.email, subject: input?.subject || 'Escape Tsunami Portal', body: input?.body || '', from_name: 'Escape Tsunami' });
          toast({ title: 'Email sent', description: account.email });
        } catch (e) {
          toast({ title: 'Email failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      addNote: async () => {
        setBusy('Add note');
        try {
          await base44.entities.PlayerNote.create({ roblox_username: robloxUsername, note: input?.note || '', author: staffName });
          toast({ title: 'Note added' });
          await onReload();
        } catch (e) {
          toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      resetStreak: async () => {
        setBusy('Reset streak');
        try {
          await base44.entities.UserStreak.deleteMany({ roblox_username: robloxUsername });
          toast({ title: 'Streak reset' });
        } catch (e) {
          toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      suspend: () => updateUser({ suspended: true, suspended_reason: input?.reason || 'Suspended via portal manager', suspended_at: new Date().toISOString(), suspended_by: staffName }, 'Account suspended'),
      unsuspend: () => updateUser({ suspended: false, suspended_reason: null }, 'Account unsuspended'),
      mute: () => updateUser({ muted_until: input?.duration ? new Date(Date.now() + parseDuration(input.duration)).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }, 'Chat muted'),
      unmute: () => updateUser({ muted_until: null }, 'Chat unmuted'),
      clearSessions: async () => {
        setBusy('Clear sessions');
        try {
          // Force re-auth by clearing the user's token server-side is not possible from client,
          // but we can set a flag that AuthContext checks
          await updateUser({ force_password_reset: false, last_seen: null }, 'Sessions cleared');
          toast({ title: 'Sessions cleared', description: 'User will need to log in again' });
        } catch (e) {
          toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      exportData: async () => {
        setBusy('Export data');
        try {
          const [mods, apps, notes, wl] = await Promise.all([
            base44.entities.Moderation.filter({ roblox_username: robloxUsername }, '-created_date', 500),
            base44.entities.Appeal.filter({ roblox_username: robloxUsername }, '-created_date', 500),
            base44.entities.PlayerNote.filter({ roblox_username: robloxUsername }, '-created_date', 100),
            base44.entities.WatchlistEntry.filter({ roblox_username: robloxUsername }, '-created_date', 100),
          ]);
          const blob = new Blob([JSON.stringify({ account: { email: account.email, roblox_username: robloxUsername, role: account.role, banned: account.banned }, moderations: mods, appeals: apps, notes, watchlist: wl, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `portal-account-${robloxUsername || account.email}.json`;
          a.click();
          URL.revokeObjectURL(a.href);
          toast({ title: 'Data exported' });
        } catch (e) {
          toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      setPrivateNote: () => updateUser({ staff_notes_private: input?.note || '' }, 'Private note set'),
      clearPrivateNote: () => updateUser({ staff_notes_private: '' }, 'Private note cleared'),
      tempBan: () => updateUser({ banned: true, banned_reason: input?.reason || 'Temporary ban', banned_at: new Date().toISOString(), banned_by: staffName, banned_until: input?.duration ? new Date(Date.now() + parseDuration(input.duration)).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }, 'Temporarily banned'),
      resetLoginAttempts: () => updateUser({ login_attempts: 0 }, 'Login attempts reset'),
      sendPasswordReset: async () => {
        setBusy('Send password reset');
        try {
          await base44.auth.resetPasswordRequest(account.email);
          toast({ title: 'Password reset email sent', description: account.email });
        } catch (e) {
          toast({ title: 'Failed to send reset email', description: e.message, variant: 'destructive' });
        } finally { setBusy(null); }
      },
      clearRobloxVerify: () => updateUser({ roblox_verified: false }, 'Roblox verification cleared'),
      resetTracking: () => updateUser({ last_ip: null, last_seen: null }, 'IP tracking reset'),
    };

    const fn = actions[key];
    if (fn) await fn();
    setDialog(null);
  };

  const variantCls = {
    danger: 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300',
    warning: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300',
    success: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300',
    default: 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300',
  };

  return (
    <>
      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{cat.title}</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.actions.map((action) => {
                const disabled = isDisabled(action.key);
                const Icon = action.icon;
                if (action.custom && action.key === 'deleteAccount') {
                  return (
                    <button
                      key={action.key}
                      disabled={disabled || !isOwner(currentUser)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${variantCls[action.variant]}`}
                    >
                      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{action.title}</div>
                        <div className="text-xs text-slate-500">{action.desc}</div>
                      </div>
                    </button>
                  );
                }
                return (
                  <button
                    key={action.key}
                    onClick={() => handleClick(action)}
                    disabled={disabled || busy !== null}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${variantCls[action.variant]}`}
                  >
                    {busy === action.title ? <Loader2 className="h-5 w-5 shrink-0 mt-0.5 animate-spin" /> : <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs text-slate-500">{action.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Delete account uses existing component */}
        {isOwner(currentUser) && !isSelf && (
          <div className="pt-2">
            <DeleteAccountButton account={account} currentUser={currentUser} />
          </div>
        )}

        {/* Related data summary */}
        {related && (
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Related Data</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">{related.moderations?.length || 0} moderations</span>
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">{related.appeals?.length || 0} appeals</span>
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">{related.watchlist?.length || 0} watchlist entries</span>
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">{related.notes?.length || 0} staff notes</span>
              {related.streak && <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">{related.streak.current_streak} day streak</span>}
            </div>
          </div>
        )}
      </div>

      {/* Input dialog */}
      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{dialog?.action?.title}</DialogTitle>
          </DialogHeader>
          <InputForm type={dialog?.type} values={inputValues} setValues={setInputValues} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
            <Button
              onClick={() => executeAction(dialog.action.key, inputValues)}
              disabled={busy !== null}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions dialog */}
      {showPerms && (
        <StaffPermissionsDialog target={account} user={currentUser} onClose={() => setShowPerms(false)} onSaved={onReload} />
      )}
    </>
  );
}

function InputForm({ type, values, setValues }) {
  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));
  if (!type) return null;

  if (type === 'quickBan') {
    const presets = [
      'Violation of website rules',
      'Ban evasion',
      'Harassment of staff',
      'Inappropriate behavior',
      'Spamming',
      'Alt account abuse',
    ];
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-400">Pick a preset reason or type a custom one:</p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set('reason', p)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${values.reason === p ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <Textarea value={values.reason || ''} onChange={(e) => set('reason', e.target.value)} rows={2} className="bg-slate-950/60 border-white/15 text-white" placeholder="Custom reason…" />
      </div>
    );
  }

  if (type === 'ban' || type === 'ip' || type === 'note' || type === 'watchlist' || type === 'suspend' || type === 'privateNote') {
    const label = { ban: 'Ban reason', ip: 'IP ban reason', note: 'Staff note', watchlist: 'Watchlist reason', suspend: 'Suspension reason', privateNote: 'Private admin note' }[type];
    const fieldKey = (type === 'note' || type === 'privateNote') ? 'note' : 'reason';
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">{label}</label>
          <Textarea value={values[fieldKey] || ''} onChange={(e) => set(fieldKey, e.target.value)} rows={3} className="bg-slate-950/60 border-white/15 text-white" />
        </div>
        {type === 'watchlist' && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Level</label>
            <select value={values.level || 'medium'} onChange={(e) => set('level', e.target.value)} className="w-full rounded-md border border-white/15 bg-slate-950/60 px-3 py-2 text-white text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  if (type === 'mute') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Duration (e.g. 1h, 24h, 7d)</label>
          <Input value={values.duration || '24h'} onChange={(e) => set('duration', e.target.value)} className="bg-slate-950/60 border-white/15 text-white" placeholder="24h" />
        </div>
        <p className="text-xs text-slate-500">The user will be unable to send messages in appeal chats until this expires.</p>
      </div>
    );
  }

  if (type === 'tempBan') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Ban reason</label>
          <Textarea value={values.reason || ''} onChange={(e) => set('reason', e.target.value)} rows={2} className="bg-slate-950/60 border-white/15 text-white" placeholder="Reason for temporary ban" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Duration (e.g. 1h, 24h, 7d, 30d)</label>
          <Input value={values.duration || '24h'} onChange={(e) => set('duration', e.target.value)} className="bg-slate-950/60 border-white/15 text-white" placeholder="24h" />
        </div>
        <p className="text-xs text-slate-500">The user will be banned from the portal until this expires. Use a permanent ban for no expiry.</p>
      </div>
    );
  }

  if (type === 'notification') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Title</label>
          <Input value={values.title || ''} onChange={(e) => set('title', e.target.value)} className="bg-slate-950/60 border-white/15 text-white" placeholder="Notification title" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Body</label>
          <Textarea value={values.body || ''} onChange={(e) => set('body', e.target.value)} rows={3} className="bg-slate-950/60 border-white/15 text-white" placeholder="Message to the player…" />
        </div>
      </div>
    );
  }

  if (type === 'email') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Subject</label>
          <Input value={values.subject || ''} onChange={(e) => set('subject', e.target.value)} className="bg-slate-950/60 border-white/15 text-white" placeholder="Email subject" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Body</label>
          <Textarea value={values.body || ''} onChange={(e) => set('body', e.target.value)} rows={4} className="bg-slate-950/60 border-white/15 text-white" placeholder="Email content…" />
        </div>
      </div>
    );
  }

  if (type === 'moderate') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Action Type</label>
          <select value={values.type || 'Warning'} onChange={(e) => set('type', e.target.value)} className="w-full rounded-md border border-white/15 bg-slate-950/60 px-3 py-2 text-white text-sm">
            <option>Warning</option>
            <option>Mute</option>
            <option>Kick</option>
            <option>Temporary Ban</option>
            <option>Permanent Ban</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Reason</label>
          <Input value={values.reason || ''} onChange={(e) => set('reason', e.target.value)} className="bg-slate-950/60 border-white/15 text-white" placeholder="Reason for moderation" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Duration (e.g. 24h, 7d)</label>
          <Input value={values.duration || ''} onChange={(e) => set('duration', e.target.value)} className="bg-slate-950/60 border-white/15 text-white" placeholder="24h" />
        </div>
      </div>
    );
  }

  return null;
}