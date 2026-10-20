import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, Heart, Play, LogIn } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import SiteNav from '@/components/SiteNav';
import DiscordInviteSection from '@/components/home/DiscordInviteSection';
import { useGameStats } from '@/hooks/useGameStats';
import { useAuth } from '@/lib/AuthContext';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import CountUp from '@/components/home/CountUp';
import FeaturesRow from '@/components/home/FeaturesRow';
import HowToPlay from '@/components/home/HowToPlay';
import HomeFAQ from '@/components/home/HomeFAQ';
import StaffSection from '@/components/home/StaffSection';
import HomeFooter from '@/components/home/HomeFooter';
import SocialProof from '@/components/home/SocialProof';
import StickyPlayButton from '@/components/home/StickyPlayButton';

const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';
const GAME_ICON_FALLBACK = 'https://tr.rbxcdn.com/180DAY-acc19bee7d79dc93900a4b042adad2e3/256/256/Image/Png/noFilter';
const GAME_NAME = 'Escape Tsunami For Developers';

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
      <HomeFooter />

      <StickyPlayButton />
    </div>
  );
}