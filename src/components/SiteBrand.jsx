import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';

export default function SiteBrand() {
  return (
    <Link to="/" className="group flex items-center gap-3 shrink-0">
      <BrandMark className="h-10 w-10" />
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