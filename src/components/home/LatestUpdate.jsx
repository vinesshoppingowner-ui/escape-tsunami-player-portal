import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionHeader from '@/components/home/SectionHeader';

export default function LatestUpdate() {
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    base44.entities.GameUpdate.filter({ published: true }, '-release_date', 1).then((u) => setUpdate(u?.[0] || null));
  }, []);

  if (!update) return null;
  const notes = (update.notes || '').split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <section id="updates" className="px-5 py-16 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <SectionHeader badge="Latest Update" icon={Megaphone} title={`Update ${update.version}`} text={update.title} tone="emerald" />
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-6 sm:p-8">
          {update.release_date && (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 mb-4">
              <Calendar className="h-3.5 w-3.5" /> {new Date(update.release_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200 rounded-xl bg-white/[0.04] border border-white/5 px-3.5 py-2.5">
                <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-emerald-400 shrink-0" /> {n}
              </li>
            ))}
          </ul>
          <Link to="/changelog" className="mt-6 inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:text-emerald-200">
            View Changelog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}