import { useEffect, useState } from 'react';
import { Megaphone, Loader2, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/PageShell';

export default function Updates() {
  const [updates, setUpdates] = useState(null);

  useEffect(() => {
    base44.entities.GameUpdate.filter({ published: true }, '-release_date', 100).then((u) => setUpdates(u || []));
  }, []);

  return (
    <PageShell badge="Changelog" icon={Megaphone} title="Updates & Changelog" text="Every update, patch, and improvement shipped to Escape Tsunami For Developers." tone="emerald">
      {updates === null ? (
        <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : updates.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-14 text-center text-slate-400">No updates published yet.</div>
      ) : (
        <div className="relative border-l border-white/10 ml-3 space-y-8">
          {updates.map((u, i) => (
            <div key={u.id} className="relative pl-8">
              <span className={`absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${i === 0 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-emerald-300">v{u.version}</span>
                {i === 0 && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">Latest</span>}
                {u.release_date && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3 w-3" /> {new Date(u.release_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">{u.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {(u.notes || '').split('\n').map((l) => l.trim()).filter(Boolean).map((n, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-300"><span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-emerald-400/70 shrink-0" /> {n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}