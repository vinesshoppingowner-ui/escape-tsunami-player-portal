import { Gamepad2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import GameStatsSection from '@/components/home/GameStatsSection';
import HowToPlay from '@/components/home/HowToPlay';
import { useGameStats } from '@/hooks/useGameStats';
import { GAME_URL } from '@/lib/siteLinks';
import { Button } from '@/components/ui/button';

export default function Game() {
  const { stats: live, loading: statsLoading } = useGameStats();
  return (
    <PageShell badge="The Game" icon={Gamepad2} title="Escape Tsunami For Developers" text="Sprint through the chaos, collect Developers, outrun towering tsunamis, and climb the leaderboards." wide>
      <a href={GAME_URL} target="_blank" rel="noreferrer">
        <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-12 px-7">Play on Roblox</Button>
      </a>
      <div className="mt-10 -mx-5">
        <GameStatsSection live={live} statsLoading={statsLoading} />
        <HowToPlay />
      </div>
    </PageShell>
  );
}