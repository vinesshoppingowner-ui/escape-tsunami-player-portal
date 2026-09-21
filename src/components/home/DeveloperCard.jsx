import { Coins, Star } from 'lucide-react';
import { Image } from '@/components/ui/image';

export const RARITY_STYLES = {
  Common: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
  Uncommon: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  Rare: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
  Epic: 'text-violet-300 bg-violet-500/15 border-violet-500/30',
  Legendary: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
  Mythic: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
};

const RARITY_GLOW = {
  Common: 'from-slate-500/10', Uncommon: 'from-emerald-500/15', Rare: 'from-sky-500/15',
  Epic: 'from-violet-500/20', Legendary: 'from-amber-500/20', Mythic: 'from-rose-500/25',
};

export default function DeveloperCard({ dev }) {
  const rarity = dev.rarity || 'Common';
  return (
    <div className={`group relative rounded-2xl border border-white/10 bg-gradient-to-b ${RARITY_GLOW[rarity]} to-white/[0.03] p-5 text-center hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
      <div className="mx-auto h-24 w-24 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center">
        {dev.image_url ? (
          <Image src={dev.image_url} alt={dev.name} fittingType="fill" className="h-full w-full" />
        ) : (
          <span className="text-3xl">👨‍💻</span>
        )}
      </div>
      <div className="mt-4 font-bold text-white text-lg leading-tight">{dev.name}</div>
      <div className="text-xs text-slate-400">Developer</div>
      {dev.description && <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">{dev.description}</p>}
      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex items-center justify-center gap-1.5 text-amber-200">
          <Coins className="h-4 w-4" /> +{dev.earnings_per_sec ?? 0} Cash / sec
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${RARITY_STYLES[rarity]}`}>
          <Star className="h-3 w-3" /> {rarity}
        </div>
      </div>
    </div>
  );
}