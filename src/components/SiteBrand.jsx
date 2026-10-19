import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { SITE_CONFIG } from '@/site.config';

export default function SiteBrand() {
  return (
    <Link to="/" className="group flex items-center gap-3 shrink-0">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[radial-gradient(120%_120%_at_25%_0%,#67e8f9_0%,#22a6f0_45%,#1d4ed8_100%)] ring-1 ring-white/25 shadow-[0_6px_18px_rgba(8,20,45,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] transition-transform duration-300 group-hover:scale-[1.06]">
        <span className="absolute inset-x-[3px] top-[3px] h-[42%] rounded-[10px] bg-gradient-to-b from-white/45 to-transparent" />
        <span className="absolute -inset-1.5 rounded-[16px] bg-cyan-400/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Waves className="relative h-[19px] w-[19px] text-white drop-shadow-[0_1px_2px_rgba(0,30,80,0.5)]" strokeWidth={2.75} />
      </span>
      <span className="leading-none">
        <span className="block font-display font-bold text-[16px] tracking-tight bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">
          {SITE_CONFIG.brand.name}
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="h-px w-4 bg-gradient-to-r from-cyan-400/70 to-transparent" />
          <span className="text-[9.5px] font-semibold text-cyan-300/70 tracking-[0.22em] uppercase">
            {SITE_CONFIG.brand.subtitle}
          </span>
        </span>
      </span>
    </Link>
  );
}