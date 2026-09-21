import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { GAME_URL, DISCORD_URL } from '@/lib/siteLinks';

const columns = [
  { title: 'Game', links: [{ label: 'Home', to: '/' }, { label: 'Game', to: '/game' }, { label: 'Developers', to: '/developers' }, { label: 'Leaderboards', to: '/leaderboards' }, { label: 'Updates', to: '/updates' }] },
  { title: 'Community', links: [{ label: 'Discord', href: DISCORD_URL }, { label: 'Roblox', href: GAME_URL }, { label: 'My Appeals', to: '/my-appeals' }, { label: 'Member Portal', to: '/portal' }] },
  { title: 'Support', links: [{ label: 'FAQ', to: '/faq' }, { label: 'Rules', to: '/rules' }, { label: 'Changelog', to: '/changelog' }, { label: 'Contact', href: DISCORD_URL }] },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 pt-14 pb-8 bg-slate-950">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Waves className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display font-semibold text-white tracking-tight text-[15px] leading-tight">
              Escape Tsunami
              <span className="block text-[10px] font-normal text-cyan-300/80 tracking-[0.18em] uppercase">For Developers</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-slate-400 max-w-xs leading-relaxed">Play the game. Collect Developers. Escape the tsunami.</p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-3">{c.title}</div>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                  ) : (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">{l.label} ↗</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Escape Tsunami</span>
        <span>Not affiliated with Roblox Corporation.</span>
      </div>
    </footer>
  );
}