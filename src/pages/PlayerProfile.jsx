import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Gavel, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import SiteNav from '@/components/SiteNav';
import PlayerProfileHeader from '@/components/admin/players/PlayerProfileHeader';
import PlayerLogsPanel from '@/components/admin/players/PlayerLogsPanel';
import PlayerHistoryPanel from '@/components/admin/appeals/PlayerHistoryPanel';
import PlayerNotesPanel from '@/components/admin/watchlist/PlayerNotesPanel';
import PlayerQuickModerate from '@/components/admin/livechat/PlayerQuickModerate';

export default function PlayerProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const staff = isOwner(user) || user?.role === 'staff';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-24 space-y-6">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to console</Link>
        {!staff ? (
          <div className="text-center py-16">
            <ShieldAlert className="h-8 w-8 text-rose-400 mx-auto" />
            <p className="mt-3 text-slate-400">Staff only.</p>
          </div>
        ) : (
          <>
            <PlayerProfileHeader key={`h${refresh}`} username={username} />
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <PlayerHistoryPanel key={`p${refresh}`} username={username} />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5"><Gavel className="h-4 w-4 text-cyan-400" /> Quick moderate</h3>
                <PlayerQuickModerate username={username} onDone={() => setRefresh((n) => n + 1)} />
              </div>
            </div>
            <PlayerLogsPanel username={username} />
            <PlayerNotesPanel username={username} />
          </>
        )}
      </main>
    </div>
  );
}