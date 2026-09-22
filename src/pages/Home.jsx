import { Link } from 'react-router-dom';
import { Users, Heart, LogIn, Snowflake, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import SiteNav from '@/components/SiteNav';
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

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <SiteNav />

      <section className="relative pt-28 pb-14 px-5">
        <div className="winter-only winter-badge absolute top-24 right-8 z-20 items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs">
          <Snowflake className="h-3.5 w-3.5 snowflake-spin" /> Winter edition
        </div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 winter-hero-image bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-4.0.3&w=1600&q=80)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/92 to-slate-950" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-end">
            <div className="lg:col-span-7 lg:pb-6">
              <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-[-0.03em] leading-[0.95] text-white">
                Outrun the wave.
                <span className="block text-slate-500">Collect the devs.</span>
              </h1>

              <p className="mt-6 text-[17px] text-slate-300 max-w-[34rem] leading-relaxed">
                A Roblox game about sprinting from a wall of water while your favourite developers
                pile up behind you. They keep earning money when you log off, so rebirth often and
                come back richer.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href={GAME_URL} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-7 text-base bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold border-0 rounded-md">
                    <Play className="h-4 w-4 mr-2" /> Play on Roblox
                  </Button>
                </a>
                <Link to="/portal" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 text-base bg-transparent border-white/20 text-white hover:bg-white/5 hover:text-white rounded-md">
                    <LogIn className="h-4 w-4 mr-2" /> Member portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 lg:translate-y-6">
              <div className="relative w-full max-w-[300px] sm:max-w-[360px] ml-auto">
                <div className="rounded-lg overflow-hidden border border-white/10 bg-slate-900">
                  <Image src={GAME_ICON} alt={GAME_NAME} fittingType="fill" className="w-full aspect-square" />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span className="truncate">{GAME_NAME}</span>
                  <span className="inline-flex items-center gap-1.5 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* data strip, not a card grid */}
          <div className="mt-16 lg:mt-24 border-t border-white/10 pt-6 flex flex-wrap items-baseline gap-x-12 gap-y-6">
            <div>
              <div className="font-display text-3xl font-bold tabular-nums">{statsLoading ? '…' : fmtNum(live?.visits ?? 0)}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                <Eye className="h-3.5 w-3.5" /> visits all-time
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold tabular-nums">{statsLoading ? '…' : fmtNum(live?.playing ?? 0)}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                <Users className="h-3.5 w-3.5" /> in-game right now
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold tabular-nums">{statsLoading ? '…' : fmtNum(live?.favorites ?? 0)}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                <Heart className="h-3.5 w-3.5" /> favourites
              </div>
            </div>
            <p className="text-[13px] text-slate-500 max-w-xs ml-auto leading-relaxed">
              Banned or muted? The member portal shows exactly what happened and lets you appeal it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}