import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Eye, Trash2 } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import WatchlistAddForm from '@/components/admin/watchlist/WatchlistAddForm';
import PlayerNotesPanel from '@/components/admin/watchlist/PlayerNotesPanel';

const LEVEL_STYLES = {
  high: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  low: 'bg-slate-500/10 text-slate-300 border-white/15',
};

export default function WatchlistTab() {
  const [entries, setEntries] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => base44.entities.WatchlistEntry.list('-created_date', 200).then((e) => setEntries(e || []));
  useEffect(() => { load(); }, []);

  const remove = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Remove this player from the watchlist?')) return;
    await base44.entities.WatchlistEntry.delete(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold text-white">Watchlist</h2>
        {entries && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{entries.length}</span>}
      </div>
      <WatchlistAddForm onAdded={load} />
      {entries === null ? (
        <div className="flex justify-center py-12 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-12 text-center text-sm text-slate-400">No players on the watchlist.</div>
      ) : (
        <div className="grid md:grid-cols-[1fr_1fr] gap-4">
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} onClick={() => setSelected(e.roblox_username)} className={`group cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-colors ${selected === e.roblox_username ? 'bg-cyan-500/[0.06] border-cyan-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'}`}>
                <RobloxAvatar username={e.roblox_username} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 font-medium truncate">{e.roblox_username}</span>
                    <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${LEVEL_STYLES[e.level] || LEVEL_STYLES.medium}`}>{e.level}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">{e.reason || 'No reason given'}</div>
                  <div className="text-[10px] text-slate-500">Added by {e.added_by || 'staff'} · {new Date(e.created_date).toLocaleDateString()}</div>
                </div>
                <button onClick={(ev) => remove(ev, e.id)} className="text-slate-500 hover:text-rose-300 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 h-fit">
            {selected ? <PlayerNotesPanel username={selected} /> : (
              <div className="text-sm text-slate-500 text-center py-8 flex flex-col items-center gap-2"><Eye className="h-6 w-6" /> Select a player to view and add notes.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}