import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, Bug } from 'lucide-react';

export default function PortalFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs text-slate-500">
      <a href="https://discord.gg/NCBqfpwPuT" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
        <MessageCircle className="h-3.5 w-3.5" /> Join Discord
      </a>
      <a href="https://discord.gg/NCBqfpwPuT" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
        <BookOpen className="h-3.5 w-3.5" /> Community Guidelines
      </a>
      <Link to="/bug-reports" className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
        <Bug className="h-3.5 w-3.5" /> Report a Bug
      </Link>
      <span className="ml-auto">Escape Tsunami for Developers Player Portal</span>
    </footer>
  );
}