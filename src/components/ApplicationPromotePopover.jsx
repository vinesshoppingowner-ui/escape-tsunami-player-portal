import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { safeParse } from '@/lib/safeParse';
import AppIcon from '@/components/apply/AppIcon';

const DISMISS_PREFIX = 'et_dismissed_app_promo_';

function isDismissed(appId) {
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}${appId}`) === '1';
  } catch {
    return false;
  }
}

function markDismissed(appId) {
  try {
    localStorage.setItem(`${DISMISS_PREFIX}${appId}`, '1');
  } catch {}
}

export function usePromotedApplication() {
  const [apps, setApps] = useState([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await base44.entities.Application.filter({ status: 'open' }, { sort: '-updated_date', limit: 25 });
        if (active) setApps(res?.items || []);
      } catch {}
    };
    load();

    const unsubscribe = base44.entities.Application.subscribe((event) => {
      if (!event) return;
      load();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const now = Date.now();
  const promoted = apps.find((a) => {
    if (a.status !== 'open') return false;
    if (a.auto_close_at && new Date(a.auto_close_at).getTime() < now) return false;
    const s = safeParse(a.settings, {});
    if (!s.promotePopover) return false;
    if (isDismissed(a.id)) return false;
    return true;
  });

  const dismiss = (appId) => {
    if (!appId) return;
    markDismissed(appId);
    setTick((t) => t + 1);
  };

  return { promoted, dismiss };
}

export default function ApplicationPromotePopover({ app, onDismiss, align = 'center' }) {
  const location = useLocation();
  if (!app) return null;
  if (location.pathname.startsWith('/apply/') || location.pathname === '/manage-applications') {
    return null;
  }

  const settings = safeParse(app.settings, {});
  const message =
    settings.promoteMessage?.trim() ||
    `We suggest applying for ${app.title} — check it out!`;
  const targetUrl = `/apply/${app.slug || app.id}`;

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
        className={`absolute -top-1.5 h-3 w-3 rotate-45 bg-[#0f172a] border-l border-t border-cyan-400/50 ${caretCls}`}
      />

      <div className="relative rounded-2xl bg-[#0f172a]/95 backdrop-blur-2xl border border-cyan-400/40 p-3.5 shadow-[0_14px_40px_rgba(6,182,212,0.22)] text-left">
        <button
          type="button"
          onClick={() => onDismiss(app.id)}
          aria-label="Close suggestion"
          className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 mb-2">
          <Sparkles className="h-2.5 w-2.5" />
          <span>Hi! Suggested for you</span>
        </div>

        <div className="flex items-start gap-2.5 pr-4">
          <div className="shrink-0 mt-0.5">
            <AppIcon icon={app.icon} className="h-8 w-8" emojiClass="text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{app.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onDismiss(app.id)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
          <Link
            to={targetUrl}
            onClick={() => onDismiss(app.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <span>Check it out</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}