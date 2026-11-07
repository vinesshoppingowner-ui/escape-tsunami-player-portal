import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, Heart, Play, LogIn, Users, Zap, Trophy, Moon, Waves, ShieldCheck, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { useInView, useReducedMotion } from 'framer-motion';
import SiteNav from '@/components/SiteNav';
import { useGameStats } from '@/hooks/useGameStats';
import { useAuth } from '@/lib/AuthContext';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { SITE_CONFIG } from '@/site.config';
import OwnershipSupportModal from '@/components/home/OwnershipSupportModal';

/* ─── Shared constants ─────────────────────────────────────────────── */

const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';
const GAME_ICON_FALLBACK = 'https://tr.rbxcdn.com/180DAY-acc19bee7d79dc93900a4b042adad2e3/256/256/Image/Png/noFilter';
const GAME_NAME = 'Escape Tsunami For Developers';
const DISCORD_URL = 'https://discord.gg/xtfdNZukN7';
const ROBLOX_GROUP_URL = 'https://www.roblox.com/groups/103398581793479/Escape-Tsunami-For-Developers';
const SUPPORT_EMAIL = SITE_CONFIG?.links?.supportEmail || 'support@escapetsunamifordevelopers.com';

const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
};

function relativeTime(date) {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* ─── Sections ─────────────────────────────────────────────────────── */

function CountUp({ value, loading, error, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  const showDash = loading || error || value == null;

  useEffect(() => {
    if (showDash || !inView) return;
    if (reduceMotion) { setDisplay(value); return; }
    const startVal = 0;
    const endVal = value;
    const startTime = Date.now();
    const duration = 1500;
    let raf;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(startVal + (endVal - startVal) * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [showDash, inView, value, reduceMotion]);

  if (showDash) return <span ref={ref}>—</span>;
  return <span ref={ref}>{fmtNum(display)}{suffix}</span>;
}

function SocialProof({ stats, loading, error }) {
  const visits = !loading && !error ? stats?.visits : null;
  const playing = !loading && !error ? stats?.playing : null;

  return (
    <div className="text-center py-6">
      <p className="text-base sm:text-lg text-slate-300">
        {visits != null ? (
          <>Join <span className="font-bold text-white">{fmtNum(visits)}+</span> players who have survived the wave</>
        ) : (
          <>Join the community</>
        )}
      </p>
      {playing != null && playing > 0 && (
        <p className="text-xs text-cyan-400 mt-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
          {fmtNum(playing)} playing right now
        </p>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: Users, title: 'Collect Developers', desc: 'Build your dream team from a roster of unique Developers, each with their own perks.' },
  { icon: Zap, title: 'Upgrade & Rebirth', desc: 'Boost your stats and rebirth for permanent multipliers that stack with every cycle.' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Climb the global rankings and prove you are the fastest survivor out there.' },
  { icon: Moon, title: 'Earn Offline', desc: 'Your Developers keep earning coins even while you are away. Come back to a payday.' },
];

function FeaturesRow() {
  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-2">Why players love it</h2>
      <p className="text-center text-slate-400 text-sm mb-10 max-w-xl mx-auto">Four reasons to jump in today</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/20 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
              <f.icon className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white text-sm">{f.title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { icon: LogIn, title: 'Join', desc: 'Jump into the game on Roblox. It is free to play on every device.' },
  { icon: Users, title: 'Collect', desc: 'Collect your favorite Developers and build a squad that fits your playstyle.' },
  { icon: Waves, title: 'Survive', desc: 'Outrun towering tsunamis, upgrade your gear, and climb the leaderboards.' },
];

function HowToPlay() {
  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">How to play</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
              <s.icon className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="text-xs font-mono text-cyan-300 mb-1">STEP {i + 1}</div>
            <h3 className="font-semibold text-white text-sm">{s.title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  { q: 'Is it free?', a: 'Yes! Escape Tsunami for Developers is completely free to play on Roblox. You can optionally purchase in-game boosts and cosmetics, but the core game is free forever.' },
  { q: 'Does it work on mobile?', a: 'Yes, the game works on all devices that support Roblox: phones, tablets, PCs, and consoles. The controls are optimized for touch and keyboard.' },
  { q: 'How do rebirths work?', a: 'When you rebirth, your progress resets but you earn a permanent multiplier that boosts all future earnings. The more you rebirth, the faster you grow.' },
  { q: 'Can I appeal a ban or warning?', a: 'Yes. If you have been moderated in-game, you can view your moderation history and submit an appeal through the Member Portal. Our staff team reviews every appeal.' },
  { q: 'Do my Developers keep earning while I am offline?', a: 'Yes! Your Developers continue generating coins even when you are not playing. Log back in to collect your earnings.' },
];

function HomeFAQ() {
  return (
    <section className="max-w-[800px] mx-auto px-5 md:px-8 py-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="rounded-xl bg-white/[0.03] border border-white/10 px-4">
            <AccordionTrigger className="text-sm font-medium text-white text-left hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-400 leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function StaffSection() {
  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <div className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-8 sm:p-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-7 w-7 text-cyan-400" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">How we keep the game fair</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Our moderation team works around the clock to keep Escape Tsunami for Developers fun and safe for everyone.
          If you have been moderated, you can view your full history and submit an appeal through the Member Portal.
        </p>
        <Link
          to="/portal"
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-sm font-semibold text-white hover:bg-white/[0.1] transition-colors"
        >
          Visit Member Portal
        </Link>
      </div>
    </section>
  );
}

function DiscordInviteSection() {
  return (
    <section className="home-discord-section">
      <div className="home-discord-card">
        <div className="home-discord-glow" />
        <div className="home-discord-content">
          <div className="home-discord-icon-wrap">
            <MessageCircle className="home-discord-icon" />
          </div>
          <div className="home-discord-text">
            <h3 className="home-discord-title">Join our Discord</h3>
            <p className="home-discord-desc">
              Connect with the community, get updates, and talk to the team.
            </p>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="home-discord-btn">
            Join Server
          </a>
        </div>
      </div>
    </section>
  );
}

function OwnershipSupportSection() {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Ownership Support Request — Escape Tsunami')}`;

  const copyEmail = () => {
    navigator.clipboard?.writeText(SUPPORT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] mt-10">
      <div className="relative overflow-hidden rounded-[22px] bg-[#0d1122]/90 border border-cyan-500/25 p-7 sm:p-9 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 15% 50%, rgba(34,211,238,0.12), transparent 55%)',
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-2">
                Ownership Support Only
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Email Ownership Support
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
                Need direct assistance from Ownership? Send a support request below to{' '}
                <span className="text-cyan-300 font-medium">{SUPPORT_EMAIL}</span> and receive an instant confirmation email receipt.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm font-bold transition-transform hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" />
              Message Ownership
            </button>
            <a
              href={mailtoHref}
              className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full bg-white/[0.06] border border-white/15 text-xs font-semibold text-slate-200 hover:bg-white/[0.12] transition-colors"
            >
              Email App
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full bg-white/[0.06] border border-white/15 text-xs font-semibold text-slate-200 hover:bg-white/[0.12] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              {copied ? 'Copied' : 'Copy Email'}
            </button>
          </div>
        </div>
      </div>
      <OwnershipSupportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        supportEmail={SUPPORT_EMAIL}
      />
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className="border-t border-white/[0.08] mt-8">
      <div className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Game</h4>
            <a href={ROBLOX_GROUP_URL} target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-2">
              Play on Roblox
            </a>
            <a href={ROBLOX_GROUP_URL} target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors">
              Roblox Group
            </a>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Portal</h4>
            <Link to="/portal" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-2">Member Portal</Link>
            <Link to="/bug-reports" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors">Report a Bug</Link>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Community</h4>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-2">Discord Server</a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors">Community Guidelines</a>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Support</h4>
            <Link to="/portal" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-2">Submit an Appeal</Link>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Ownership Support Request — Escape Tsunami')}`} className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-2">Email Ownership ({SUPPORT_EMAIL})</a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors">Contact Staff</a>
          </div>
        </div>
        <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Escape Tsunami for Developers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function StickyPlayButton() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B0D13]/95 backdrop-blur-xl border-t border-white/10 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <a
        href={GAME_URL}
        target="_blank"
        rel="noreferrer"
        className="home-btn home-btn-primary w-full justify-center"
      >
        <Play className="home-glyph" /> Play on Roblox
        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/25">FREE</span>
      </a>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function HomePage() {
  const { stats: live, loading: statsLoading, error: statsError } = useGameStats();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const stats = [
    { icon: Eye, label: 'Total Visits', value: statsLoading ? null : live?.visits, countUp: true },
    { icon: ThumbsUp, label: 'Like Ratio', value: statsLoading ? null : live?.likeRatio, suffix: '%', countUp: true },
    { icon: Heart, label: 'Favorites', value: statsLoading ? null : live?.favorites, countUp: true },
  ];

  const robloxUsername = user?.roblox_username || user?.data?.roblox_username;

  return (
    <div className="home-page min-h-screen text-white overflow-x-hidden pb-20 md:pb-0">
      <SiteNav />

      {/* Winter badge — hidden on mobile via CSS */}
      <div className="winter-only winter-badge absolute top-24 right-8 z-20 items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-cyan-500/20 text-cyan-300 text-sm font-medium backdrop-blur-sm">
        <span className={reduceMotion ? '' : 'snowflake-spin'} style={{ display: 'inline-flex' }}>❄</span> Winter Edition
      </div>

      <section className="home-hero">
        <div className="home-copy">
          <h1 className="home-headline">
            Escape <span className="home-shine">Tsunami</span>
          </h1>
          <div className="home-subhead">For Developers</div>
          <p className="home-description">
            Sprint through the chaos, collect your favorite Developers, and outrun towering tsunamis. Upgrade, rebirth, and climb the leaderboards — your Developers keep earning even while you are offline.
          </p>
          <div className="home-actions">
            <a href={GAME_URL} target="_blank" rel="noreferrer" className="home-btn home-btn-primary">
              <Play className="home-glyph" /> Play on Roblox
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/25">FREE</span>
            </a>
            {user ? (
              <Link to="/portal" className="home-btn home-btn-secondary">
                {robloxUsername ? (
                  <span className="flex items-center gap-2">
                    <RobloxAvatar username={robloxUsername} size={20} />
                    Open Portal
                  </span>
                ) : (
                  <><LogIn className="home-glyph" /> Open Portal</>
                )}
              </Link>
            ) : (
              <Link to="/portal" className="home-btn home-btn-secondary">
                <LogIn className="home-glyph" /> Member Portal
              </Link>
            )}
          </div>
        </div>

        <div className="home-phone-wrap">
          <div className="home-phone">
            <div className="home-phone-screen">
              <div className="home-speaker" />
              <div className="home-screen-top">
                <span>Escape Tsunami for Developers</span>
                <span className="home-signal" />
              </div>
              {statsLoading ? (
                <div className="home-game-art" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ) : (
                <img
                  src={live?.thumbnail || GAME_ICON_FALLBACK}
                  alt={GAME_NAME}
                  className="home-game-art"
                  width={256}
                  height={256}
                  loading="eager"
                />
              )}
              <div className="home-phone-info">
                <div className="home-playing">
                  {statsLoading || statsError ? '—' : `${fmtNum(live?.playing)} playing now`}
                </div>
                <div className="home-join">Join the community</div>
                <div className="home-favorites">
                  <span className="home-heart">♥</span>
                  <span className="home-favnum">{statsLoading || statsError ? '—' : fmtNum(live?.favorites)}</span>
                  <span>favorites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SocialProof stats={live} loading={statsLoading} error={statsError} />

      <section className="home-stats-section">
        <div className="home-stats" aria-live="polite">
          {stats.map((s) => (
            <div key={s.label} className="home-stat">
              <s.icon className="home-stat-icon" />
              <div className="home-stat-value">
                {s.relative ? (
                  <span>{statsLoading ? '—' : relativeTime(live?.lastUpdated)}</span>
                ) : s.countUp ? (
                  <CountUp value={s.value} loading={statsLoading} error={statsError} suffix={s.suffix} />
                ) : (
                  <span>{statsLoading ? '—' : fmtNum(s.value)}</span>
                )}
              </div>
              <div className="home-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <FeaturesRow />
      <HowToPlay />
      <HomeFAQ />
      <StaffSection />
      <DiscordInviteSection />
      <OwnershipSupportSection />
      <HomeFooter />

      <StickyPlayButton />
    </div>
  );
}