import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Search,
  Scale,
  ShieldAlert,
  CheckCircle2,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Check,
  Circle,
} from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import PortalFooter from '@/components/portal/PortalFooter';
import { Button } from '@/components/ui/button';
import { useUserNotifications, NOTIFICATION_META, getNotificationDestination } from '@/hooks/useUserNotifications';

const TYPE_ICONS = {
  appeal_decision: Scale,
  moderation_issued: ShieldAlert,
  moderation_expired: CheckCircle2,
  staff_message: MessageSquare,
};

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'appeal_decision', label: 'Appeals' },
  { id: 'moderations', label: 'Moderations' },
  { id: 'staff_message', label: 'Staff & Apps' },
];

export default function Notifications() {
  const { notifications, unreadCount, loading, refresh, markRead, markAllRead } = useUserNotifications();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = 'Notifications · Escape Tsunami Portal';
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'appeal_decision' && n.type !== 'appeal_decision') return false;
    if (filter === 'moderations' && n.type !== 'moderation_issued' && n.type !== 'moderation_expired') return false;
    if (filter === 'staff_message' && n.type !== 'staff_message') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchBody = (n.body || '').toLowerCase().includes(q);
      if (!matchTitle && !matchBody) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-5 pt-24 pb-20">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent border border-white/10 p-6 sm:p-7 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">
                <Bell className="h-3.5 w-3.5" /> Notification Center
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-slate-400">
                Stay updated on your appeal decisions, account moderations, applications, and messages from staff.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={markAllRead}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                >
                  <CheckCheck className="h-4 w-4 mr-1.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_TABS.map((t) => {
              const active = filter === t.id;
              const count =
                t.id === 'all'
                  ? notifications.length
                  : t.id === 'unread'
                  ? unreadCount
                  : t.id === 'moderations'
                  ? notifications.filter((n) => n.type === 'moderation_issued' || n.type === 'moderation_expired').length
                  : notifications.filter((n) => n.type === t.id).length;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilter(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-200'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] text-slate-300 tabular-nums">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
            />
          </div>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-12 text-center">
            <Sparkles className="h-9 w-9 text-slate-600 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-white">No notifications found</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {filter !== 'all' || search
                ? 'Try switching your filter tab or clearing your search query.'
                : "You're all caught up! New alerts about your appeals, moderations, or applications will show up here automatically."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((n) => {
              const meta = NOTIFICATION_META[n.type] || NOTIFICATION_META.staff_message;
              const Icon = TYPE_ICONS[n.type] || MessageSquare;
              const { link, linkLabel } = getNotificationDestination(n);
              return (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-colors flex items-start gap-3.5 ${
                    n.read
                      ? 'bg-white/[0.02] border-white/10 hover:border-white/15'
                      : 'bg-cyan-500/[0.06] border-cyan-500/30 hover:border-cyan-500/45'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconCls}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.badgeCls}`}>
                          {meta.label}
                        </span>
                        {!n.read && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Unread
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(n.created_date).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white mt-1.5">{n.title}</h3>
                    {n.body && <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">{n.body}</p>}

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
                      {link ? (
                        <Link
                          to={link}
                          onClick={() => !n.read && markRead(n.id, true)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                        >
                          {linkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : <span />}

                      <button
                        type="button"
                        onClick={() => markRead(n.id, !n.read)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {n.read ? (
                          <>
                            <Circle className="h-3 w-3" /> Mark as unread
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Mark as read
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PortalFooter />
      </main>
    </div>
  );
}