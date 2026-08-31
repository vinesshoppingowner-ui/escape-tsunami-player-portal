import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Gavel, ExternalLink } from 'lucide-react';

export default function WallOfShame() {
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Moderation.list('-moderation_date', 50);
        const recent = (all || [])
          .filter((m) => m.moderation_type && m.moderation_type.includes('Ban') && m.status === 'Active')
          .slice(0, 10);
        setBans(recent);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Gavel className="h-5 w-5 text-rose-300" />
        </span>
        <div>
          <h3 className="font-semibold text-white">Wall of Shame</h3>
          <p className="text-xs text-slate-400">Recent active bans — exploiters caught in action.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : bans.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">No active bans on record. The seas are calm. 🌊</p>
      ) : (
        <div className="space-y-2">
          {bans.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/30 border border-white/5 px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="text-cyan-300 font-medium">{m.roblox_username}</span>
                  <span className="text-slate-500"> · {m.moderation_type}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{m.reason}</div>
              </div>
              {m.evidence_type === 'screenshot' && m.evidence_image_url ? (
                <a href={m.evidence_image_url} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
                  Evidence <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}