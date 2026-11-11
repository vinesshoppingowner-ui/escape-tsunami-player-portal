import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Lock, Unlock, UserCheck, Send, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { getAdminRole } from '@/lib/adminRole';
import { safeParse } from '@/lib/safeParse';
import NewBadge from '@/components/ui/new-badge';

export function isStrictAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.data?.is_owner === true || user.is_owner === true) return true;
  if (getAdminRole() === 'admin') return true;
  return false;
}

export default function AdminExecutiveActions({ response, application, onUpdate }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applicantUser, setApplicantUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [togglingLock, setTogglingLock] = useState(false);
  const [sendingExecNotice, setSendingExecNotice] = useState(false);

  const reviewObj = useMemo(() => safeParse(response?.ai_review, {}), [response?.ai_review]);
  const decisionLocked = Boolean(reviewObj.admin_decision_locked);

  useEffect(() => {
    let active = true;
    const findApplicant = async () => {
      if (!response?.submitted_by_email && !response?.roblox_username) {
        setApplicantUser(null);
        return;
      }
      setLoadingUser(true);
      try {
        const allUsers = await base44.entities.User.list();
        if (!active) return;
        const emailLower = (response.submitted_by_email || '').trim().toLowerCase();
        const rbxLower = (response.roblox_username || '').trim().toLowerCase();
        const found = (allUsers || []).find((u) => {
          const uEmail = (u.email || '').trim().toLowerCase();
          const uRbx = (u.roblox_username || u.data?.roblox_username || '').trim().toLowerCase();
          return (emailLower && uEmail === emailLower) || (rbxLower && uRbx === rbxLower);
        });
        setApplicantUser(found || null);
      } catch {
        if (active) setApplicantUser(null);
      } finally {
        if (active) setLoadingUser(false);
      }
    };
    findApplicant();
    return () => {
      active = false;
    };
  }, [response?.id, response?.submitted_by_email, response?.roblox_username]);

  if (!isStrictAdmin(user)) return null;

  const handleRoleChange = async (newRole) => {
    if (!applicantUser?.id || applicantUser.role === newRole) return;
    setUpdatingRole(true);
    try {
      await base44.entities.User.update(applicantUser.id, { role: newRole });
      setApplicantUser((prev) => (prev ? { ...prev, role: newRole } : prev));
      await base44.entities.StaffLog.create({
        staff_username: user?.roblox_username || user?.email || 'Administrator',
        action: 'user_role_changed',
        target: response.roblox_username || response.submitted_by_email || applicantUser.email,
        detail: `Promoted/changed portal role to "${newRole}" from application review (${application.title})`,
      }).catch(() => {});
      toast({
        title: `Applicant role updated to ${newRole.toUpperCase()}`,
        description: `${applicantUser.email} now has ${newRole} permissions.`,
      });
    } catch (e) {
      toast({ title: 'Could not update role', description: e.message, variant: 'destructive' });
    } finally {
      setUpdatingRole(false);
    }
  };

  const toggleDecisionLock = async () => {
    setTogglingLock(true);
    try {
      const nextLocked = !decisionLocked;
      const nextReview = {
        ...reviewObj,
        admin_decision_locked: nextLocked,
        admin_locked_by: nextLocked ? (user?.email || 'Administrator') : null,
        admin_locked_at: nextLocked ? new Date().toISOString() : null,
      };
      const updated = await base44.entities.ApplicationResponse.update(response.id, {
        ai_review: JSON.stringify(nextReview),
      });
      onUpdate?.(updated);
      toast({
        title: nextLocked ? 'Decision locked by Administrator' : 'Decision unlocked',
        description: nextLocked
          ? 'Regular staff members can no longer change or override this verdict.'
          : 'Staff members can now edit this review again.',
      });
    } catch {
      toast({ title: 'Failed to update decision lock', variant: 'destructive' });
    } finally {
      setTogglingLock(false);
    }
  };

  const handleFastTrackAcceptAndPromote = async () => {
    setUpdatingRole(true);
    try {
      const nextReview = {
        ...reviewObj,
        admin_decision_locked: true,
        admin_locked_by: user?.email || 'Administrator',
        admin_locked_at: new Date().toISOString(),
      };
      const updated = await base44.entities.ApplicationResponse.update(response.id, {
        status: 'accepted',
        reviewed_by: user?.email || 'Administrator',
        reviewed_at: new Date().toISOString(),
        ai_review: JSON.stringify(nextReview),
        applicant_feedback:
          response.applicant_feedback ||
          `Approved directly by Executive Administration for ${application.title}. Welcome to the team!`,
      });
      if (applicantUser?.id && applicantUser.role === 'user') {
        await base44.entities.User.update(applicantUser.id, { role: 'staff' }).catch(() => {});
        setApplicantUser((prev) => (prev ? { ...prev, role: 'staff' } : prev));
      }
      if (response.roblox_username) {
        await base44.entities.Notification.create({
          roblox_username: response.roblox_username,
          title: `Executive Approval: ${application.title}`,
          body: `An Administrator has approved your application for "${application.title}" and locked the final verdict!`,
          type: 'staff_message',
          read: false,
        }).catch(() => {});
      }
      onUpdate?.(updated);
      toast({
        title: 'Executive Fast-Track Complete',
        description: 'Application accepted, decision locked, and applicant promoted to Staff.',
      });
    } catch (e) {
      toast({ title: 'Fast-track failed', description: e.message, variant: 'destructive' });
    } finally {
      setUpdatingRole(false);
    }
  };

  const sendExecutiveNotice = async () => {
    if (!response.roblox_username) {
      toast({ title: 'No Roblox username on this submission', variant: 'destructive' });
      return;
    }
    setSendingExecNotice(true);
    try {
      await base44.entities.Notification.create({
        roblox_username: response.roblox_username,
        title: `Administrator Notice — ${application.title}`,
        body: `Your application for "${application.title}" is currently being reviewed directly by Senior Administration.`,
        type: 'staff_message',
        read: false,
      });
      toast({ title: 'Executive notice sent to applicant portal' });
    } catch {
      toast({ title: 'Could not send notice', variant: 'destructive' });
    } finally {
      setSendingExecNotice(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-violet-500/[0.06] to-slate-950 border border-amber-500/35 p-4 space-y-3 shadow-[0_8px_30px_rgba(245,158,11,0.08)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Crown className="h-3.5 w-3.5 text-amber-300" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Administrator Executive Controls
              </span>
              <NewBadge />
            </div>
            <p className="text-[10px] text-amber-300/70">Admin-only · Hidden from regular staff</p>
          </div>
        </div>
      </div>

      {/* 1-Click Executive Fast-Track */}
      <button
        type="button"
        disabled={updatingRole}
        onClick={handleFastTrackAcceptAndPromote}
        className="w-full h-9 px-3 rounded-xl bg-gradient-to-r from-amber-500/25 via-violet-500/25 to-amber-500/25 hover:from-amber-500/35 hover:to-violet-500/35 border border-amber-400/40 text-xs font-semibold text-amber-100 inline-flex items-center justify-center gap-1.5 transition-all"
      >
        {updatingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5 text-amber-300" />}
        <span>1-Click Accept, Promote to Staff & Lock</span>
      </button>

      {/* Portal Role Assignment */}
      <div className="rounded-xl bg-slate-950/60 border border-white/10 p-2.5 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Applicant Portal Role</span>
          {loadingUser ? (
            <span className="text-slate-500 inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Looking up…
            </span>
          ) : applicantUser ? (
            <span className="text-amber-300 font-semibold uppercase text-[10px]">
              Current: {applicantUser.role || 'user'}
            </span>
          ) : (
            <span className="text-slate-500 text-[10px]">Account not found</span>
          )}
        </div>
        {applicantUser && (
          <div className="grid grid-cols-3 gap-1.5">
            {['user', 'staff', 'admin'].map((r) => {
              const active = (applicantUser.role || 'user') === r;
              return (
                <button
                  key={r}
                  type="button"
                  disabled={updatingRole || active}
                  onClick={() => handleRoleChange(r)}
                  className={`h-7 rounded-lg border text-[11px] font-semibold capitalize transition-colors ${
                    active
                      ? 'bg-amber-500/25 border-amber-400/50 text-amber-200'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision Lock & Executive Ping */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={togglingLock}
          onClick={toggleDecisionLock}
          className={`h-8 px-2.5 rounded-lg border text-[11px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
            decisionLocked
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Lock this decision so regular staff cannot override it"
        >
          {togglingLock ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : decisionLocked ? (
            <Lock className="h-3.5 w-3.5 text-rose-300" />
          ) : (
            <Unlock className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>{decisionLocked ? 'Verdict Locked' : 'Lock Verdict'}</span>
        </button>

        <button
          type="button"
          disabled={sendingExecNotice}
          onClick={sendExecutiveNotice}
          className="h-8 px-2.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-[11px] font-medium text-violet-200 inline-flex items-center justify-center gap-1.5 transition-colors"
          title="Send an official Senior Administration review alert to the applicant"
        >
          {sendingExecNotice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-violet-300" />}
          <span>Exec Notice</span>
        </button>
      </div>

      {decisionLocked && (
        <div className="flex items-center gap-1.5 text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Locked by {reviewObj.admin_locked_by || 'Admin'} — staff cannot modify status.</span>
        </div>
      )}
    </div>
  );
}