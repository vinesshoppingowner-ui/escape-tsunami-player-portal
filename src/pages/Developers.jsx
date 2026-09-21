import { Code2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import MeetDevelopers from '@/components/home/MeetDevelopers';

export default function Developers() {
  return (
    <PageShell badge="Collection" icon={Code2} title="Developers" text="Every collectible Developer in the game, their rarity, and how much cash they earn for you." tone="violet" wide>
      <div className="-mx-5 -mt-16">
        <MeetDevelopers limit={Infinity} showViewAll={false} />
      </div>
    </PageShell>
  );
}