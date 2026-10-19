import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '@/site.config';

export default function PortalFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs text-slate-500">
      {SITE_CONFIG.footer.links.map((l) =>
        l.external ? (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <l.icon className="h-3.5 w-3.5" /> {l.label}
          </a>
        ) : (
          <Link key={l.label} to={l.to} className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
            <l.icon className="h-3.5 w-3.5" /> {l.label}
          </Link>
        )
      )}
      <span className="ml-auto">{SITE_CONFIG.footer.copyright}</span>
    </footer>
  );
}