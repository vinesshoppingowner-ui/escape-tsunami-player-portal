import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Loader2 } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';

export default function PlayersTab() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    base44.entities.Moderation.list('-created_date', 200).then((mods) => {
      const map = new Map();
      (mods || []).forEach((m) => {
        const k = m.roblox_username;
        if (!k) return;
        const e = map.get(k) || { username: k, count: 0, last: m.moderation_type };
        e.count += 1;
        map.set(k, e);
      });
      setRecent([...map.values()].slice(0, 24));
    });
  }, []);

  const go = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/admin/player/${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="mt-6 space-y-5">
      <form onSubmit={go} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Open a player profile by Roblox username…"
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-900/60 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50" />
        </div>
        <button type="submit" className="px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-medium text-white">Open</button>
      </form>
      <h3 className="text-sm font-semibold text-slate-300">Recently moderated players</h3>
      {recent === null ? (
        <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : recent.length === 0 ? (
        <p className="text-sm text-slate-500">No moderated players yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {recent.map((p) => (
            <Link key={p.username} to={`/admin/player/${encodeURIComponent(p.username)}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-500/40 transition-colors">
              <RobloxAvatar username={p.username} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.username}</div>
                <div className="text-xs text-slate-500">{p.count} moderation{p.count > 1 ? 's' : ''} · last: {p.last}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}