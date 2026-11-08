import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ShieldAlert, Scale, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useUserNotifications } from '@/hooks/useUserNotifications';

const DISMISS_PREFIX = 'et_dismissed_portal_alert_';

function isDismissed(key) {
  if (!key) return true;
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}${key}`) === '1';
  } catch {
    return false;
  }
}

function markDismissed(key) {
  if (!key) return;
  try {
    localStorage.setItem(`${DISMISS_PREFIX}${key}`, '1');
  } catch {}
}

export function usePortalTabAlert() {
  const { user } = useAuth();
  const username = user?.roblox_username || user?.data?.roblox_username || '';
  const { notifications, markRead } = useUserNotifications();
  const [latestMod, setLatestMod] = useState(null);
  const [latestAppeal, setLatestAppeal] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    if (!user || !username) {
      setLatestMod(null);
      setLatestAppeal(null);
      return;
    }

    const loadDirect = async () => {
      try {
        const [modPage, appealPage] = await Promise.all([
          base44.entities.Moderation.filter({ roblox_username: username }, { sort: '-created_date', limit: 1 }),
          base44.entities.Appeal.filter({ roblox_username: username }, { sort: '-updated_date', limit: 5 }),
        ]);
        if (!active) return;
        setLatestMod(modPage?.items?.[0] || null);
        const reviewed = (appealPage?.items || []).find(
          (a) => !a.removed && (a.status === 'Approved' || a.status === 'Denied' || a.status === 'Under Review')
        );
        setLatestAppeal(reviewed || null);
      } catch {}
    };

    loadDirect();

    const unsubMod = base44.entities.Moderation.subscribe((ev) => {
      if (ev?.data?.roblox_username?.toLowerCase() === username.toLowerCase()) {
        loadDirect();
      }
    });
    const unsubAppeal = base44.entities.Appeal.subscribe((ev) => {
      if (ev?.data?.roblox_username?.toLowerCase() === username.toLowerCase()) {
        loadDirect();
      }
    });

    return () => {
      active = false;
      unsubMod?.();
      unsubAppeal?.();
    };
  }, [user, username]);

  // 1. Check unread notifications for moderation or appeal review first
  const unreadNotif = (notifications || []).find(
    (n) =>
      !n.read &&
      (n.type === 'moderation_issued' || n.type === 'moderation_expired' || n.type === 'appeal_decision') &&
      !isDismissed(`notif_${n.id}`)
  );

  let alert = null;

  if (unreadNotif) {
    const isMod = unreadNotif.type === 'moderation_issued' || unreadNotif.type === 'moderation_expired';
    alert = {
      key: `notif_${unreadNotif.id}`,
      notifId: unreadNotif.id,
      kind: isMod ? 'moderation' : 'appeal',
      badge: isMod ? 'New Moderation' : 'Appeal Reviewed',
      title: unreadNotif.title || (isMod ? 'New moderation on your account' : 'Your appeal has been reviewed'),
      body: unreadNotif.body || 'Open your Member Portal to view the full details.',
      targetUrl: isMod ? '/portal?tab=moderations' : '/portal?tab=appeals',
    };
  } else if (latestAppeal) {
    const appealKey = `appeal_${latestAppeal.id}_${latestAppeal.status}_${latestAppeal.decided_at || ''}`;
    if (!isDismissed(appealKey)) {
      alert = {
        key: appealKey,
        kind: 'appeal',
        badge: `Appeal ${latestAppeal.status}`,
        title: `Your appeal is now ${latestAppeal.status}`,
        body:
          latestAppeal.staff_response ||
          'Staff updated the status of your appeal. Check the Portal for details.',
        targetUrl: '/portal?tab=appeals',
      };
    }
  } else if (latestMod && latestMod.status === 'Active') {
    const modKey = `mod_${latestMod.id}`;
    if (!isDismissed(modKey)) {
      alert = {
        key: modKey,
        kind: 'moderation',
        badge: 'New Moderation',
        title: `${latestMod.moderation_type}: ${latestMod.reason || 'Account action'}`,
        body: 'A moderation record was added to your account. Review it in the Portal.',
        targetUrl: '/portal?tab=moderations',
      };
    }
  }

  const dismiss = (alertItem) => {
    if (!alertItem) return;
    markDismissed(alertItem.key);
    if (alertItem.notifId) {
      markRead(alertItem.notifId, true);
    }
    setTick((t) => t + 1);
  };

  return { alert, dismiss };
}

export default function PortalAlertPopover({ alert, onDismiss, align = 'center' }) {
  const location = useLocation();
  if (!alert) return null;
  if (location.pathname === '/portal') return null;

  const isMod = alert.kind === 'moderation';
  const Icon = isMod ? ShieldAlert : Scale;

  const borderCls = isMod ? 'border-rose-400/45' : 'border-cyan-400/45';
  const shadowCls = isMod
    ? 'shadow-[0_14px_40px_rgba(244,63,94,0.22)]'
    : 'shadow-[0_14px_40px_rgba(6,182,212,0.22)]';
  const badgeCls = isMod
    ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
    : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300';
  const iconWrapCls = isMod
    ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
    : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300';

  const alignCls =
    align === 'right'
      ? 'right-2 sm:right-4'
      : 'left-1/2 -translate-x-1/2';

  const caretCls =
    align === 'right'
      ? 'right-5'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className={`absolute top-full mt-2.5 z-[60] w-72 sm:w-80 ${alignCls} animate-in fade-in slide-in-from-top-1 duration-200`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Upward pointer arrow */}
      <div
        className={`absolute -top-1.5 h-3 w-3 rotate-45 bg-[#0f172a] border-l border-t ${borderCls} ${caretCls}`}
      />

      <div className={`relative rounded-2xl bg-[#0f172a]/95 backdrop-blur-2xl border ${borderCls} p-3.5 ${shadowCls} text-left`}>
        <button
          type="button"
          onClick={() => onDismiss(alert)}
          aria-label="Close portal alert"
          className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider mb-2 ${badgeCls}`}>
          <Icon className="h-2.5 w-2.5" />
          <span>{alert.badge}</span>
        </div>

        <div className="flex items-start gap-2.5 pr-4">
          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconWrapCls}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{alert.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
              {alert.body}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onDismiss(alert)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
          <Link
            to={alert.targetUrl}
            onClick={() => onDismiss(alert)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <span>Open Portal</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}