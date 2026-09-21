import { useEffect, useState } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionHeader from '@/components/home/SectionHeader';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

const CATEGORIES = [
  { key: 'cash', label: 'Cash', fmt: (v) => v.toLocaleString() },
  { key: 'rebirths', label: 'Rebirths', fmt: (v) => v.toLocaleString() },
  { key: 'developers', label: 'Developers', fmt: (v) => v.toLocaleString() },
  { key: 'playtime', label: 'Playtime', fmt: (v) => `${Math.floor(v / 60)}h ${v % 60}m` },
];
const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM = ['border-amber-400/40 bg-amber-500/[0.08]', 'border-slate-300/30 bg-slate-400/[0.08]', 'border-orange-500/30 bg-orange-500/[0.08]'];

export default function LeaderboardSection({ limit = 10 }) {
  const [category, setCategory] = useState('cash');
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    setEntries(null);
    base44.entities.LeaderboardEntry.filter({ category }, '-value', limit).then((e) => setEntries(e || []));
  }, [category, limit]);

  const cat = CATEGORIES.find((c) => c.key === category);
  const top3 = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  return (
    <section id="leaderboards" className="px-5 py-16 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <SectionHeader badge="Leaderboards" icon={Trophy} title="Top Players" text="The best of the best — updated by the staff team." tone="amber" />
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto max-w-full">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)} className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c.key ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:text-white'}`}>{c.label}</button>
            ))}
          </div>
        </div>
        {entries === null ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-14 text-center text-slate-400">No {cat.label.toLowerCase()} rankings yet.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              {top3.map((e, i) => (
                <div key={e.id} className={`rounded-2xl border p-5 text-center ${PODIUM[i]} ${i === 0 ? 'sm:order-2 sm:-mt-4' : i === 1 ? 'sm:order-1' : 'sm:order-3'}`}>
                  <div className="text-3xl">{MEDALS[i]}</div>
                  <div className="mt-2 flex justify-center"><RobloxAvatar username={e.roblox_username} size={i === 0 ? 64 : 52} /></div>
                  <div className="mt-2 font-bold text-white truncate">{e.roblox_username}</div>
                  <div className={`mt-0.5 font-semibold ${i === 0 ? 'text-amber-300 text-xl' : 'text-slate-200'}`}>{cat.fmt(e.value)}</div>
                </div>
              ))}
            </div>
            {rest.length > 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                {rest.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-7 text-sm font-semibold text-slate-500">#{i + 4}</span>
                    <RobloxAvatar username={e.roblox_username} size={32} />
                    <span className="flex-1 font-medium text-white truncate">{e.roblox_username}</span>
                    <span className="text-sm text-slate-300 font-semibold">{cat.fmt(e.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}