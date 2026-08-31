import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Waves, Users, Heart, Gamepad2, ArrowRight, LogIn, Trophy,
  Zap, Footprints, RefreshCw, Building2, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import SiteNav from '@/components/SiteNav';

const GAME = {
  name: 'Escape Tsunami For Developers',
  icon: 'https://tr.rbxcdn.com/180DAY-acc19bee7d79dc93900a4b042adad2e3/256/256/Image/Png/noFilter',
  url: 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers',
  group: 'https://www.roblox.com/communities/33513762',
  creator: 'Waitrose Shopping',
  visits: 269,
  favorites: 3,
  maxPlayers: 5,
  created: 'August 17, 2026',
};

const features = [
  { icon: Footprints, title: 'Outrun the Wave', text: 'Grab your favorite Developers and bolt for high ground before the tsunami rolls in.' },
  { icon: Waves, title: 'Read the Water', text: 'Tower-high waves sweep the arena with seconds of warning. Watch the signs, pick a lane, and don\'t look back.' },
  { icon: Zap, title: 'Build Your Empire', text: 'Stack speed and power up your Developers so the cash piles up faster every single round.' },
  { icon: RefreshCw, title: 'Break the Limit', text: 'Hit a wall? Rebirth to wipe the slate and come back stronger with a permanent earnings boost.' },
  { icon: Building2, title: 'Grow Your Roster', text: 'Unlock extra slots and run more Developers at once — your base keeps earning even while you\'re offline.' },
  { icon: Trophy, title: 'Claim the Crown', text: 'Out-survive the whole server and etch your name at the top of the leaderboard.' },
];

const stats = [
  { icon: Users, label: 'Total Visits', value: GAME.visits.toLocaleString() },
  { icon: Heart, label: 'Favorites', value: GAME.favorites.toLocaleString() },
  { icon: Gamepad2, label: 'Max Players', value: GAME.maxPlayers },
  { icon: ShieldCheck, label: 'Status', value: 'Live' },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' } }),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-5">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-cyan-500/20 blur-[140px]" />
          <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <motion.div variants={fade} initial="hidden" animate="show" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-300 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              Live on Roblox · by {GAME.creator}
            </motion.div>

            <motion.h1
              variants={fade} custom={1} initial="hidden" animate="show"
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]"
            >
              Escape <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">Tsunami</span>
              <span className="block text-white/90 text-3xl sm:text-4xl lg:text-5xl mt-2 font-semibold">For Developers</span>
            </motion.h1>

            <motion.p variants={fade} custom={2} initial="hidden" animate="show" className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
              Sprint through the chaos, collect your favorite Developers, and outrun towering tsunamis. Upgrade, rebirth, and climb the leaderboards — your Developers keep earning even while you are offline.
            </motion.p>

            <motion.div variants={fade} custom={3} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-3">
              <a href={GAME.url} target="_blank" rel="noreferrer">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 h-12 px-7 text-base shadow-lg shadow-cyan-500/25">
                  <Gamepad2 className="h-5 w-5 mr-2" /> Play on Roblox
                </Button>
              </a>
              <Link to="/portal">
                <Button size="lg" variant="outline" className="h-12 px-7 text-base bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                  <LogIn className="h-5 w-5 mr-2" /> Member Portal
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fade} custom={4} initial="hidden" animate="show" className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3.5 backdrop-blur-sm">
                  <s.icon className="h-4 w-4 text-cyan-400 mb-2" />
                  <div className="text-xl font-semibold text-white">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-[2rem] blur-2xl" />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl shadow-cyan-900/40 bg-slate-900">
              <div className="relative aspect-square">
                <Image
                  src={GAME.icon}
                  alt={GAME.name}
                  fittingType="fill"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <div className="text-xs text-cyan-300 font-medium tracking-wide uppercase">Now Playing</div>
                  <div className="text-lg font-semibold text-white mt-0.5">{GAME.name}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 rounded-2xl bg-slate-900 border border-white/10 px-4 py-2.5 shadow-xl">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
                <span className="font-semibold text-white">{GAME.favorites}</span>
                <span className="text-slate-400">favorites</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 mb-3">How it plays</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Survive, collect, and rise</h2>
            <p className="mt-4 text-slate-400">Everything you can do in-game, in one quick look.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fade} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
                className="group rounded-2xl bg-white/[0.05] border border-white/15 p-6 shadow-lg shadow-cyan-950/40 hover:border-cyan-500/40 hover:bg-white/[0.07] hover:shadow-cyan-500/10 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="font-semibold text-white text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Portal CTA */}
      <section className="px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 sm:p-14">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Members Only
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  Got moderated in-game?
                </h2>
                <p className="mt-4 text-slate-300 leading-relaxed max-w-lg">
                  The Member Portal lets you review every recent moderation action taken on your account and submit an appeal directly to the staff team — all in one place.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> View your recent warnings, mutes, kicks, and bans</li>
                  <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Submit an appeal with your side of the story</li>
                  <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Track the status of every appeal in real time</li>
                </ul>
              </div>
              <div className="flex md:justify-end">
                <Link to="/portal">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 h-12 px-7 text-base shadow-lg shadow-cyan-500/25">
                    Enter the Portal <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Waves className="h-4 w-4 text-cyan-400" />
            Escape Tsunami For Developers · fan & community hub
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-400">
            <a href={GAME.url} target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition-colors">Roblox ↗</a>
            <a href={GAME.group} target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition-colors">Group ↗</a>
          </div>
        </div>
      </footer>
    </div>
  );
}