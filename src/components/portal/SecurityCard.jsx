import { useState } from 'react';
import { Mail, User, Calendar, Check, Copy, ExternalLink, CheckCircle2, Fingerprint } from 'lucide-react';

export default function SecurityCard({ user, robloxUsername }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!user) return null;

  const copyValue = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const memberSince = user.created_date
    ? new Date(user.created_date).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const rows = [
    {
      key: 'email',
      icon: Mail,
      label: 'Linked email',
      value: user.email || 'Not linked',
      copyable: Boolean(user.email),
      badge: user.email ? { text: 'Verified', color: '#37d49b', bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.28)' } : null,
    },
    {
      key: 'roblox',
      icon: User,
      label: 'Roblox username',
      value: robloxUsername || 'Not verified',
      copyable: Boolean(robloxUsername),
      externalHref: robloxUsername
        ? `https://www.roblox.com/search/users?keyword=${encodeURIComponent(robloxUsername)}`
        : null,
      badge: robloxUsername
        ? { text: 'Linked', color: '#37d49b', bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.28)' }
        : { text: 'Unverified', color: '#f7b84f', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.33)' },
    },
    {
      key: 'since',
      icon: Calendar,
      label: 'Member since',
      value: memberSince,
      copyable: false,
      badge: { text: 'Active', color: '#b6bdc8', bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)' },
    },
    {
      key: 'id',
      icon: Fingerprint,
      label: 'Portal Account ID',
      value: user.id || '—',
      copyable: Boolean(user.id),
      badge: null,
    },
  ];

  return (
    <section className="studio-card flex flex-col justify-start gap-[15px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-[10px] text-[15px] leading-[1.35] font-semibold tracking-[-0.02em] text-[#f3f5f7]">
          <span
            className="grid place-items-center flex-none w-[31px] h-[31px] rounded-[9px]"
            style={{
              border: '1px solid rgba(16, 185, 129, 0.23)',
              background: 'rgba(16, 185, 129, 0.09)',
              color: '#37d49b',
            }}
          >
            <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.6 3 8.1 7 10 4-1.9 7-5.4 7-10V6l-7-3Z" />
              <path d="M9 12h6" />
            </svg>
          </span>
          <div>
            <div>Account &amp; Security</div>
            <div className="text-xs font-normal text-[#a0a7b4] mt-0.5">
              Verified identity and linked credentials for your portal profile.
            </div>
          </div>
        </div>

        <span
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#37d49b',
          }}
        >
          <CheckCircle2 className="h-3 w-3" /> Protected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center gap-3 p-3 rounded-[12px] bg-[#1c202b] border border-[#303541] hover:border-[#4b5662] transition-colors"
          >
            <div
              className="h-9 w-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{
                border: '1px solid rgba(16, 185, 129, 0.23)',
                background: 'rgba(16, 185, 129, 0.09)',
                color: '#37d49b',
              }}
            >
              <r.icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#a0a7b4]">{r.label}</span>
                {r.badge && (
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold tracking-wide uppercase"
                    style={{
                      color: r.badge.color,
                      background: r.badge.bg,
                      border: `1px solid ${r.badge.border}`,
                    }}
                  >
                    {r.badge.text}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-[#f3f5f7] truncate tabular-nums mt-0.5">
                {r.value}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {r.externalHref && (
                <a
                  href={r.externalHref}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Roblox profile"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-[#a0a7b4] hover:text-[#f3f5f7] hover:bg-white/[0.06] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {r.copyable && (
                <button
                  type="button"
                  onClick={() => copyValue(r.key, r.value)}
                  title={`Copy ${r.label.toLowerCase()}`}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-[#a0a7b4] hover:text-[#f3f5f7] hover:bg-white/[0.06] transition-colors"
                >
                  {copiedField === r.key ? (
                    <Check className="h-3.5 w-3.5 text-[#37d49b]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}