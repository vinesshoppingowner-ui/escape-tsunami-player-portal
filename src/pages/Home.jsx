import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import HeroSection from '@/components/home/HeroSection';
import GameStatsSection from '@/components/home/GameStatsSection';
import HowToPlay from '@/components/home/HowToPlay';
import MeetDevelopers from '@/components/home/MeetDevelopers';
import LeaderboardSection from '@/components/home/LeaderboardSection';
import LatestUpdate from '@/components/home/LatestUpdate';
import CommunitySection from '@/components/home/CommunitySection';
import { useGameStats } from '@/hooks/useGameStats';

export default function Home() {
  const { stats: live, loading: statsLoading } = useGameStats();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <SiteNav />
      <HeroSection live={live} statsLoading={statsLoading} />
      <GameStatsSection live={live} statsLoading={statsLoading} />
      <HowToPlay />
      <MeetDevelopers limit={4} />
      <LeaderboardSection limit={10} />
      <LatestUpdate />
      <CommunitySection />
      <SiteFooter />
    </div>
  );
}