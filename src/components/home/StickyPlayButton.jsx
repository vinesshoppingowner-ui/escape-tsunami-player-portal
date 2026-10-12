import { Play } from 'lucide-react';

const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';

export default function StickyPlayButton() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B0D13]/95 backdrop-blur-xl border-t border-white/10 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <a
        href={GAME_URL}
        target="_blank"
        rel="noreferrer"
        className="home-btn home-btn-primary w-full justify-center"
      >
        <Play className="home-glyph" /> Play on Roblox
        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/25">FREE</span>
      </a>
    </div>
  );
}