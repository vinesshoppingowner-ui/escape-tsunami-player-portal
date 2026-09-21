import { Users, Eye, Heart, Server, Globe, Clock, Play } from 'lucide-react';
import { GAME_URL, fmtNum } from '@/lib/siteLinks';

function timeAgo(d) {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function GameStatsSection({ live, statsLoading }) {
  const online = !statsLoading && live != null;
  const stats = [
    { icon: Users, label: 'Players', value: statsLoading ? '—' : `${live?.playing ?? 0} Playing`, dot: true },
    { icon: Eye, label: 'Visits', value: statsLoading ? '—' : fmtNum(live?.visits) },
    { icon: Heart, label: 'Favorites', value: statsLoading ? '—' : fmtNum(live?.favorites) },
    { icon: Globe, label: 'Server Status', value: statsLoading ? 'Checking…' : online ? 'Online' : 'Unknown', dot: true, tone: online ? 'text-emerald-300' : 'text-slate-300' },
    { icon: Server, label: 'Active Servers', value: statsLoading ? '—' : live?.servers ?? 0 },
    { icon: Clock, label: 'Last Updated', value: statsLoading ? '—' : timeAgo(live?.updated) },
  ];

  return (
    <section id="stats" className="px-5 pb-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              Live on Roblox · Game Statistics
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Last synced: {live?.lastSynced ? timeAgo(live.lastSynced) : '—'}</span>
              <a href={GAME_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold">
                <Play className="h-3.5 w-3.5" /> Play Now
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-4 hover:border-cyan-500/30 transition-colors">
                <s.icon className="h-4 w-4 text-cyan-400 mb-2" />
                <div className={`text-lg font-semibold flex items-center gap-1.5 ${s.tone || 'text-white'}`}>
                  {s.dot && online && <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />}
                  <span className="truncate">{s.value}</span>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}