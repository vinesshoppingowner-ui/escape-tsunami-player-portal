import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Loader2, Crown, Clock } from 'lucide-react';
import PlayerSessionRow, { formatDuration } from '@/components/analytics/PlayerSessionRow';

export default function PlayerCount() {
  const [sessions, setSessions] = useState(null);
  const [tab, setTab] = useState('online');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const load = () => base44.entities.PlayerSession.list('-joined_at', 200).then(setSessions);
    load();
    const unsub = base44.entities.PlayerSession.subscribe(load);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsub(); clearInterval(t); };
  }, []);

  if (!sessions) {
    return <div className="mt-6 flex items-center text-slate-400 text-sm"><Loader2 className="h-4 w-4 animate-spin mr-2 text-cyan-400" /> Loading players…</div>;
  }

  const online = sessions.filter((s) => s.online);
  const unique = new Set(sessions.map((s) => s.roblox_username)).size;
  const premium = new Set(sessions.filter((s) => s.is_premium).map((s) => s.roblox_username)).size;
  const done = sessions.filter((s) => !s.online && s.duration_seconds);
  const avg = done.length ? done.reduce((a, s) => a + s.duration_seconds, 0) / done.length : 0;
  const list = tab === 'online' ? online : sessions;

  const stats = [
    { label: 'Playing now', value: online.length, icon: Users, color: 'text-emerald-400' },
    { label: 'Unique players', value: unique, icon: Users, color: 'text-cyan-400' },
    { label: 'Premium players', value: premium, icon: Crown, color: 'text-amber-400' },
    { label: 'Avg. playtime', value: formatDuration(avg), icon: Clock, color: 'text-violet-400' },
  ];

  return (
    <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <h2 className="font-semibold text-white">Player count</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <div className="mt-1.5 text-xl font-bold tabular-nums">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-3 p-0.5 rounded-lg bg-slate-900/60 border border-white/10 w-fit">
        {[['online', `Online (${online.length})`], ['all', 'Recent sessions']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`px-3 py-1 rounded-md text-xs ${tab === v ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {list.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">{tab === 'online' ? 'Nobody is in game right now.' : 'No sessions recorded yet.'}</p>
        ) : list.map((s) => <PlayerSessionRow key={s.id} session={s} now={now} />)}
      </div>
    </div>
  );
}