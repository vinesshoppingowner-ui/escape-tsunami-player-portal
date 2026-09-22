import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';

export default function SiteBrand() {
  return (
    <Link to="/" className="flex items-baseline gap-2.5 shrink-0">
      <BrandMark className="h-6 w-6 translate-y-[3px]" />
      <span className="font-display font-semibold text-[17px] tracking-tight text-white">
        Escape Tsunami
      </span>
      <span className="hidden sm:inline text-[12px] text-slate-500">for developers</span>
    </Link>
  );
}