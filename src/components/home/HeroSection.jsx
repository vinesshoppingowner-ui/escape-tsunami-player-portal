import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Heart, LogIn, Loader2, Snowflake, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import CurrentEvent from '@/components/home/CurrentEvent';
import { GAME_URL, GAME_ICON, GAME_NAME, fmtNum } from '@/lib/siteLinks';

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' } }),
};

export default function HeroSection({ live, statsLoading }) {
  return (
    <section className="relative pt-32 pb-16 px-5">
      <div className="winter-only winter-badge absolute top-24 right-8 z-20 items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-cyan-500/20 text-cyan-300 text-sm font-medium backdrop-blur-sm">
        <Snowflake className="h-4 w-4 snowflake-spin" /> Winter Edition
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 winter-hero-image bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-4.0.3&w=1600&q=80)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <motion.div variants={fade} initial="hidden" animate="show" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            Live on Roblox
          </motion.div>

          <motion.h1 variants={fade} custom={1} initial="hidden" animate="show" className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
            Escape <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">Tsunami</span>
            <span className="block text-white/90 text-3xl sm:text-4xl lg:text-5xl mt-2 font-semibold">For Developers</span>
          </motion.h1>

          <motion.p variants={fade} custom={2} initial="hidden" animate="show" className="mt-6 text-lg text-slate-200 max-w-xl leading-[1.6]">
            Sprint through the chaos, collect your favorite Developers, and outrun towering tsunamis. Upgrade, rebirth, and climb the leaderboards — your Developers keep earning even while you are offline.
          </motion.p>

          <motion.div variants={fade} custom={3} initial="hidden" animate="show" className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a href={GAME_URL} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 h-12 px-7 text-base shadow-lg shadow-cyan-500/25">
                <Play className="h-5 w-5 mr-2" /> Play on Roblox
              </Button>
            </a>
            <Link to="/portal" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 text-base bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                <LogIn className="h-5 w-5 mr-2" /> Member Portal
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fade} custom={4} initial="hidden" animate="show">
            <CurrentEvent />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }} className="relative mx-auto w-full max-w-[280px] sm:max-w-md">
          <div className="absolute -inset-6 bg-gradient-to-br from-cyan-500/40 to-blue-600/40 rounded-[2.5rem] blur-3xl" />
          <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl shadow-cyan-900/40 bg-slate-900">
            <div className="relative aspect-square">
              <Image src={GAME_ICON} alt={GAME_NAME} fittingType="fill" className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-300" />
                  <div>
                    <div className="text-lg font-semibold text-white">{statsLoading ? '…' : `${fmtNum(live?.playing ?? 0)} playing now`}</div>
                    <div className="text-xs text-cyan-300/80 font-medium tracking-wide uppercase">Join the community</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-3 right-0 sm:-right-3 rounded-2xl bg-slate-900 border border-white/10 px-4 py-2.5 shadow-xl">
            <div className="flex items-center gap-2 text-sm">
              {statsLoading ? <Loader2 className="h-4 w-4 text-rose-400 animate-spin" /> : <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />}
              <span className="font-semibold text-white">{statsLoading ? '…' : fmtNum(live?.favorites ?? 0)}</span>
              <span className="text-slate-400">favorites</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}