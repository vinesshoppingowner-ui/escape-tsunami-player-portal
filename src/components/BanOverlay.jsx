import { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Globe, Lock, Calendar, Clock, Hash, AlertTriangle, Unlock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { UNLISTED_ID } from '@/lib/unlistedAppeal';
import { WEBSITE_BAN_TYPE } from '@/lib/banAppealGuard';
import BanAppealForm from '@/components/BanAppealForm';
import BanAppealStatus from '@/components/BanAppealStatus';
import { getBanStart, appealCoversBan } from '@/lib/banStart';
import UserAvatar from '@/components/profile/UserAvatar';
import { Image } from '@/components/ui/image';
import { isOwner } from '@/lib/isOwner';
import { clearBanToken } from '@/lib/banEvasion';

export const DEFAULT_BAN_HERO_IMAGE =
  'https://media.base44.com/images/public/6a94d0a4d41cd1f012a10c06/432f75760_generated_image.png';

export default function BanOverlay({ user, ipBan, onAdminUnbanned }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const [reporting, setReporting] = useState(false);
  const [latest, setLatest] = useState(null);
  const [unbanningSelf, setUnbanningSelf] = useState(false);

  const isAccountBanned = Boolean(user?.data?.banned || user?.banned);
  const isIpBanOnly = !isAccountBanned;

  const reason =
    (isAccountBanned && (user?.data?.banned_reason || user?.banned_reason)) ||
    ipBan?.reason ||
    'Violation of website & network security rules';
  const bannedAt =
    (isAccountBanned && (user?.data?.banned_at || user?.banned_at)) ||
    ipBan?.created_date ||
    null;
  const bannedUntil = user?.data?.banned_until || user?.banned_until;
  const username = user?.data?.roblox_username || user?.roblox_username;
  const accountName =
    user?.full_name ||
    user?.email?.split('@')[0] ||
    username ||
    (ipBan?.ip_address ? `Network (${ipBan.ip_address})` : 'Blocked Network');
  const canSelfUnban = Boolean(user && isOwner(user));

  useEffect(() => {
    if (!username) return;
    base44.entities.Appeal.filter(
      { roblox_username: username, moderation_id: UNLISTED_ID, unlisted_type: WEBSITE_BAN_TYPE },
      { sort: '-created_date', limit: 1 }
    ).then(async (r) => {
      const a = r.items?.[0] || null;
      if (a?.status === 'Approved' && !appealCoversBan(a, await getBanStart(user))) setLatest(null);
      else setLatest(a);
    });
  }, [username, reporting]);

  const handleAdminSelfUnban = async () => {
    if (!canSelfUnban || unbanningSelf) return;
    setUnbanningSelf(true);
    try {
      if (user?.id && (user?.data?.banned || user?.banned)) {
        await base44.entities.User.update(user.id, {
          banned: false,
          banned_reason: null,
          banned_until: null,
        }).catch(() => {});
      }
      if (ipBan?.id) {
        await base44.entities.IpBan.delete(ipBan.id).catch(() => {});
      }
      const allBans = await base44.entities.IpBan.list().catch(() => []);
      const lastIp = user?.last_ip || user?.data?.last_ip || ipBan?.ip_address;
      for (const b of allBans || []) {
        if (lastIp && b.ip_address === lastIp) {
          await base44.entities.IpBan.delete(b.id).catch(() => {});
        }
      }
      clearBanToken();
      if (onAdminUnbanned) onAdminUnbanned();
      window.location.reload();
    } finally {
      setUnbanningSelf(false);
    }
  };

  // Watchdog: if the ban overlay is removed or hidden via Inspect Element / Console, auto-reload immediately
  useEffect(() => {
    let active = true;
    const triggerReload = () => {
      if (!active) return;
      active = false;
      window.location.reload();
    };

    const verifyIntegrity = () => {
      if (!active) return;
      const el = overlayRef.current;
      const card = cardRef.current;
      if (!el || !document.body.contains(el) || !card || !el.contains(card)) {
        triggerReload();
        return;
      }
      const style = window.getComputedStyle(el);
      const cardStyle = window.getComputedStyle(card);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        parseFloat(style.opacity || '1') < 0.8 ||
        style.pointerEvents === 'none' ||
        parseInt(style.zIndex || '0', 10) < 50 ||
        el.offsetWidth < window.innerWidth * 0.5 ||
        el.offsetHeight < window.innerHeight * 0.5 ||
        cardStyle.display === 'none' ||
        cardStyle.visibility === 'hidden' ||
        parseFloat(cardStyle.opacity || '1') < 0.8
      ) {
        triggerReload();
      }
    };

    const observer = new MutationObserver(() => {
      verifyIntegrity();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    const interval = setInterval(verifyIntegrity, 300);

    return () => {
      active = false;
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const isTempBan = bannedUntil && new Date(bannedUntil) > new Date();

  return (
    <div
      ref={overlayRef}
      data-ban-overlay="active"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#07090E] overflow-y-auto"
    >
      {/* Ambient crimson glow backdrop */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.18),transparent_60%)]" />

      <div
        ref={cardRef}
        className="relative w-full max-w-lg rounded-2xl bg-[#0D111A] border border-rose-500/30 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(244,63,94,0.12)] overflow-hidden my-auto"
      >
        {/* Top Hero Visual Banner */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
          <Image
            src={DEFAULT_BAN_HERO_IMAGE}
            alt="Security Firewall"
            className="w-full h-full object-cover opacity-85"
            fittingType="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D111A] via-[#0D111A]/55 to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3.5 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-400/40 text-[11px] font-bold uppercase tracking-wider text-rose-200">
            {isIpBanOnly ? <Globe className="h-3.5 w-3.5 text-rose-400" /> : <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
            <span>{isIpBanOnly ? 'IP / Network Blocked' : 'Account Suspended'}</span>
          </div>

          {/* Avatar / Shield emblem overlapping bottom of banner */}
          <div className="absolute -bottom-6 left-6 flex items-end gap-3">
            <div className="relative h-16 w-16 rounded-2xl bg-[#131926] border-2 border-rose-500/50 shadow-xl flex items-center justify-center overflow-hidden">
              {user ? (
                <UserAvatar user={user} size={60} />
              ) : (
                <Globe className="h-8 w-8 text-rose-400" />
              )}
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-rose-600 border border-slate-950 flex items-center justify-center">
                <Lock className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Title & Explanation */}
        <div className="px-6 pt-9 pb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isIpBanOnly ? 'Your IP Address is Banned' : 'Your Portal Account is Banned'}
          </h1>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            {isIpBanOnly
              ? 'Access from your network connection to the Escape Tsunami for Developers portal has been restricted by security.'
              : 'Your account has been suspended from accessing the Escape Tsunami for Developers portal.'}
          </p>

          {/* Highlighted Reason Box */}
          <div className="mt-4 rounded-xl bg-rose-500/[0.08] border border-rose-500/25 p-3.5 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-300/80">
                Enforcement Reason
              </div>
              <div className="text-sm font-medium text-white mt-0.5 break-words">{reason}</div>
            </div>
          </div>

          {/* Metadata Details */}
          <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 divide-y divide-white/5">
            <Row icon={ ShieldAlert } label={isIpBanOnly ? 'Target' : 'Account'} value={accountName} />
            {ipBan?.ip_address && (
              <Row icon={ Globe } label="Blocked IP" value={ipBan.ip_address} mono accent="text-rose-300" />
            )}
            <Row
              icon={ Calendar }
              label="Issued"
              value={
                bannedAt
                  ? new Date(bannedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Active'
              }
            />
            {isTempBan && (
              <Row
                icon={ Clock }
                label="Expires"
                value={new Date(bannedUntil).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                accent="text-amber-300"
              />
            )}
            <Row icon={ Hash } label="Reference ID" value={ipBan?.id || user?.id || 'ip-enforcement'} mono />
          </div>

          {/* Appeal / Report Mistake Section */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
            {latest && !reporting && (
              <div>
                <BanAppealStatus appeal={latest} />
              </div>
            )}
            {latest?.status === 'Approved' ? null : reporting ? (
              <BanAppealForm user={user} reason={reason} onCancel={() => setReporting(false)} />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setReporting(true)}
                  className="text-xs sm:text-sm text-slate-300 underline underline-offset-4 hover:text-white transition-colors"
                >
                  {latest ? 'Submit another appeal report' : 'Think this ban is a mistake? Submit an appeal'}
                </button>

                {canSelfUnban && (
                  <button
                    type="button"
                    disabled={unbanningSelf}
                    onClick={handleAdminSelfUnban}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-xs font-semibold text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    {unbanningSelf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                    <span>Admin Override: Unban Me</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value, mono, accent }) {
  return (
    <div className="flex justify-between items-center gap-4 px-3.5 py-2.5">
      <span className="inline-flex items-center gap-2 text-xs text-slate-400 shrink-0">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-500" />}
        {label}
      </span>
      <span
        className={`text-xs sm:text-sm text-right truncate ${
          mono ? 'font-mono text-slate-300 text-xs' : 'text-white font-medium'
        } ${accent || ''}`}
      >
        {value}
      </span>
    </div>
  );
}