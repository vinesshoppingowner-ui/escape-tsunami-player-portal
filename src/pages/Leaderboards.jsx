import { Trophy } from 'lucide-react';
import PageShell from '@/components/PageShell';
import LeaderboardSection from '@/components/home/LeaderboardSection';

export default function Leaderboards() {
  return (
    <PageShell badge="Rankings" icon={Trophy} title="Leaderboards" text="Top players by cash, rebirths, Developers collected, and playtime." tone="amber" wide>
      <div className="-mx-5 -mt-16">
        <LeaderboardSection limit={50} />
      </div>
    </PageShell>
  );
}