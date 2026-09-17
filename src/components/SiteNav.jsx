import { Link, useLocation } from 'react-router-dom';
import { Waves, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';

export default function SiteNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const desktopLinks = [
    { label: 'Home', to: '/' },
    ...(user?.role === 'admin' ? [{ label: 'Staff', to: '/admin' }] : []),
  ];
  const mobileLinks = [
    { label: 'Home', to: '/' },
    { label: 'Member Portal', to: '/portal' },
    ...(user?.role === 'admin' ? [{ label: 'Staff', to: '/admin' }] : []),
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-slate-950/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Waves className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-white tracking-tight text-[15px] leading-tight">
            Escape Tsunami
            <span className="block text-[10px] font-normal text-cyan-300/80 tracking-[0.18em] uppercase">For Developers</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {desktopLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  active ? 'text-white border-cyan-400' : 'text-slate-300 hover:text-white border-transparent'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/portal">
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
              <LogIn className="h-4 w-4 mr-1.5" /> Member Portal
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-5 py-4 space-y-1">
          {mobileLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5 text-sm"
            >
              {l.label}
            </Link>
          ))}
          <a href={GAME_URL} target="_blank" rel="noreferrer" className="block px-3 py-2.5 rounded-lg text-cyan-300 text-sm">
            Play on Roblox ↗
          </a>
        </div>
      )}
    </header>
  );
}