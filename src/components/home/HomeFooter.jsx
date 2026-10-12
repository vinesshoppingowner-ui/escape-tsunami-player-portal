import { Link } from 'react-router-dom';
import { MessageCircle, Gamepad2, LogIn, BookOpen, Mail } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/xtfdNZukN7';
const ROBLOX_GROUP_URL = 'https://www.roblox.com/groups/103398581793479/Escape-Tsunami-For-Developers';

export default function HomeFooter() {
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