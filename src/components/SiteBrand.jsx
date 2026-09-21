import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export default function SiteBrand() {
  return (
    <Link to="/" className="group flex items-center gap-3 shrink-0">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
        <span className="absolute inset-x-1 top-0.5 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/35 to-transparent" />
        <span className="absolute -inset-1 rounded-2xl bg-cyan-400/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Waves className="relative h-5 w-5 text-white drop-shadow" strokeWidth={2.5} />
      </span>
      <span className="leading-none">
        <span className="block font-display font-bold text-[16px] tracking-tight bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">
          Escape Tsunami
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="h-px w-4 bg-gradient-to-r from-cyan-400/70 to-transparent" />
          <span className="text-[9.5px] font-semibold text-cyan-300/70 tracking-[0.22em] uppercase">
            For Developers
          </span>
        </span>
      </span>
    </Link>
  );
}