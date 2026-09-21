import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionHeader from '@/components/home/SectionHeader';
import DeveloperCard from '@/components/home/DeveloperCard';

export default function MeetDevelopers({ limit = 4, showViewAll = true }) {
  const [devs, setDevs] = useState(null);

  useEffect(() => {
    base44.entities.Developer.list('sort_order', limit === Infinity ? 200 : limit).then((d) => setDevs(d || []));
  }, [limit]);

  return (
    <section id="developers" className="px-5 py-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeader badge="Meet the Developers" icon={Code2} title="Collect unique Developers" text="Build your ultimate team — every Developer earns cash for you, even while you're offline." tone="violet" />
        {devs === null ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : devs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-14 text-center text-slate-400">Developers are being added — check back soon.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {devs.map((d) => <DeveloperCard key={d.id} dev={d} />)}
          </div>
        )}
        {showViewAll && devs?.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/developers" className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200">
              View all Developers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}