import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Scale, ShieldAlert, CheckCircle2, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useUserPrefs, notifAllowed } from '@/lib/userPrefs';
import { useUserNotifications, NOTIFICATION_META, getNotificationDestination } from '@/hooks/useUserNotifications';

const TYPE_ICONS = {
  appeal_decision: Scale,
  moderation_issued: ShieldAlert,
  moderation_expired: CheckCircle2,
  staff_message: MessageSquare,
};

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsBell({ notifications: passedNotifications, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const prefs = useUserPrefs();
  const live = useUserNotifications();

  const notifications = passedNotifications
    ? passedNotifications.filter((n) => notifAllowed(prefs, n.type))
    : live.notifications;

  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (onMarkAllRead) onMarkAllRead();
    else live.markAllRead();
  };

  const handleItemClick = (n) => {
    if (!n.read && !passedNotifications) {
      live.markRead(n.id, true);
    } else if (!n.read && onMarkAllRead) {
      onMarkAllRead();
    }
    setOpen(false);
    const { link } = getNotificationDestination(n);
    if (link) navigate(link);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open notifications"
        title="Notifications"
        className="relative h-9 w-9 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[28rem] flex flex-col overflow-hidden rounded-2xl bg-[#0F1320] border border-white/10 shadow-2xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F1320]/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Sparkles className="h-7 w-7 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">You're all caught up</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appeal updates, moderation alerts, and staff messages will appear here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 12).map((n) => {
                  const meta = NOTIFICATION_META[n.type] || NOTIFICATION_META.staff_message;
                  const Icon = TYPE_ICONS[n.type] || MessageSquare;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/[0.04] ${
                        n.read ? '' : 'bg-cyan-500/[0.06]'
                      }`}
                    >
                      <span className={`mt-0.5 h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.iconCls}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">{formatRelative(n.created_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />}
                          <p className="text-sm font-medium text-white truncate">{n.title}</p>
                        </div>
                        {n.body && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 bg-white/[0.02] p-2.5">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-cyan-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                View all notifications <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}