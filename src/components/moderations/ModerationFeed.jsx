import { useState } from 'react';
import ModerationRow, { ROW_GRID } from '@/components/moderations/ModerationRow';

export default function ModerationFeed({ moderations, appealFor, onAppeal, appealsLocked }) {
  const [tab, setTab] = useState('all');
  const pending = (m) => ['Pending', 'Under Review'].includes(appealFor(m.id)?.status);
  const tabs = [
    { id: 'all', label: 'All', filter: () => true },
    { id: 'active', label: 'Active', filter: (m) => m.status === 'Active' },
    { id: 'pending', label: 'Appeals pending', filter: pending },
  ];
  const current = tabs.find((t) => t.id === tab);
  const rows = moderations.filter(current.filter);

  return (
    <div className="rounded-lg bg-panel border border-white/[0.08] overflow-hidden">
      <div className="flex items-center gap-1 px-2 border-b border-white/[0.08]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label} <span className="text-slate-500">({moderations.filter(t.filter).length})</span>
          </button>
        ))}
      </div>
      <div className={`hidden sm:grid ${ROW_GRID} px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400`}>
        <span className="pl-6">Type / Reason</span><span>Date</span><span>Status</span><span>Appeal</span><span className="text-right">Action</span>
      </div>
      {rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">Nothing here.</div>
      ) : (
        rows.map((m) => (
          <ModerationRow key={m.id} moderation={m} appeal={appealFor(m.id)} onAppeal={() => onAppeal(m)} appealsLocked={appealsLocked} />
        ))
      )}
    </div>
  );
}