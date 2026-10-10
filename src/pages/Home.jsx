import { Link } from 'react-router-dom';
import { Users, Heart, Snowflake, Play, Eye, Radio, LogIn } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import DiscordInviteSection from '@/components/home/DiscordInviteSection';
import { useGameStats } from '@/hooks/useGameStats';

const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';
const GAME_ICON = 'https://tr.rbxcdn.com/180DAY-acc19bee7d79dc93900a4b042adad2e3/256/256/Image/Png/noFilter';
const GAME_NAME = 'Escape Tsunami For Developers';

const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
};

export default function Home() {
  const { stats: live, loading: statsLoading } = useGameStats();

  const stats = [
    { icon: Eye, label: 'Total Visits', value: statsLoading ? '—' : fmtNum(live?.visits ?? 0) },
    { icon: Heart, label: 'Favorites', value: statsLoading ? '—' : fmtNum(live?.favorites ?? 0) },
    { icon: Users, label: 'Playing Now', value: statsLoading ? '—' : fmtNum(live?.playing ?? 0) },
    { icon: Radio, label: 'Status', value: 'Live', live: true },
  ];

  return (
    <div className="home-page min-h-screen text-white overflow-x-hidden">
      <SiteNav />

      <div className="winter-only winter-badge absolute top-24 right-8 z-20 items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-cyan-500/20 text-cyan-300 text-sm font-medium backdrop-blur-sm">
        <Snowflake className="h-4 w-4 snowflake-spin" /> Winter Edition
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
            </a>
            <Link to="/portal" className="home-btn home-btn-secondary">
              <LogIn className="home-glyph" /> Member Portal
            </Link>
          </div>
        </div>

        <div className="home-phone-wrap">
          <div className="home-phone">
            <div className="home-phone-screen">
              <div className="home-speaker" />
              <div className="home-screen-top">
                <span>Escape Tsunami</span>
                <span className="home-signal" />
              </div>
              <img src={GAME_ICON} alt={GAME_NAME} className="home-game-art" />
              <div className="home-phone-info">
                <div className="home-playing">
                  {statsLoading ? '—' : `${fmtNum(live?.playing ?? 0)} playing now`}
                </div>
                <div className="home-join">Join the community</div>
                <div className="home-favorites">
                  <span className="home-heart">♥</span>
                  <span className="home-favnum">{statsLoading ? '—' : fmtNum(live?.favorites ?? 0)}</span>
                  <span>favorites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-stats-section">
        <div className="home-stats">
          {stats.map((s) => (
            <div key={s.label} className="home-stat">
              <s.icon className="home-stat-icon" />
              <div className="home-stat-value">
                {s.live && <span className="home-live-dot" />}
                {s.value}
              </div>
              <div className="home-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <DiscordInviteSection />

      <div className="home-lower" aria-hidden="true">
        <span className="home-lower-line" />
        <span className="home-lower-line" />
      </div>
    </div>
  );
}