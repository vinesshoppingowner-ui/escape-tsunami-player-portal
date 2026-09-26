import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { STATUS_STYLES } from '@/components/admin/appeals/appealMeta';
import SectionLabel from '@/components/SectionLabel';

export default function PlayerHistoryPanel({ username, currentAppealId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Moderation.filter({ roblox_username: username }, '-moderation_date', 50),
      base44.entities.Appeal.filter({ roblox_username: username }, '-created_date', 50),
    ]).then(([mods, apps]) => setData({ mods: mods || [], apps: apps || [] }));
  }, [username]);

  if (!data) return <div className="flex items-center gap-2 text-sm text-slate-400 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading player history…</div>;

  const stats = [
    { label: 'Moderations', value: data.mods.length },
    { label: 'Active', value: data.mods.filter((m) => m.status === 'Active').length },
    { label: 'Appeals', value: data.apps.length },
    { label: 'Approved', value: data.apps.filter((a) => a.status === 'Approved').length },
  ];

  return (
    <div className="space-y-3">
      <SectionLabel>Player history</SectionLabel>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        {stats.map((s, i) => (
          <span key={s.label} className="inline-flex items-baseline gap-1.5">
            {i > 0 && <span className="text-slate-700 mr-1">•</span>}
            <span className="text-lg font-semibold text-white">{s.value}</span>
            <span className="text-slate-400">{s.label}</span>
          </span>
        ))}
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/70">
        {data.mods.map((m) => (
          <div key={m.id} className="py-2 flex items-center gap-2 text-sm">
            <span className="text-white font-medium shrink-0">{m.moderation_type}</span>
            <span className="text-slate-400 truncate flex-1">{m.reason}</span>
            <span className="text-[11px] text-slate-500 shrink-0">{m.moderation_date ? new Date(m.moderation_date).toLocaleDateString() : '—'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">{m.status}</span>
          </div>
        ))}
        {data.apps.map((a) => (
          <div key={a.id} className="py-2 flex items-center gap-2 text-sm">
            <span className="text-indigo-300 font-medium shrink-0">Appeal{a.id === currentAppealId ? ' (this)' : ''}</span>
            <span className="text-slate-400 truncate flex-1">{a.appeal_reason}</span>
            <span className="text-[11px] text-slate-500 shrink-0">{new Date(a.created_date).toLocaleDateString()}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${STATUS_STYLES[a.status] || ''}`}>{a.removed ? 'Removed' : a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}