import { useState } from 'react';

const LABELS = {
  appeal_decision: 'Appeal decision', appeal_assigned: 'Appeal assigned', moderation_issued: 'Moderation issued',
  moderation_edited: 'Moderation edited', moderation_deleted: 'Moderation deleted', user_role_changed: 'Role changed',
  permissions_changed: 'Permissions changed', action_undone: 'Action undone',
};

export default function ActivityFeed({ logs }) {
  const [type, setType] = useState('all');
  const shown = logs.filter((l) => type === 'all' || l.action === type).slice(0, 150);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {[['all', 'All'], ...Object.entries(LABELS)].map(([k, l]) => (
          <button key={k} onClick={() => setType(k)} className={`px-2.5 py-1 rounded-md text-xs border ${type === k ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' : 'border-white/10 text-slate-400 hover:text-white'}`}>{l}</button>
        ))}
      </div>
      {shown.length === 0 ? <div className="py-10 text-center text-sm text-slate-500">No activity.</div> : (
        <div className="rounded-xl border border-white/10 divide-y divide-white/5 max-h-[520px] overflow-y-auto">
          {shown.map((l) => (
            <div key={l.id} className="px-4 py-2.5 text-sm flex gap-3">
              <span className="text-[10px] uppercase tracking-wide text-amber-300/80 w-32 shrink-0 pt-0.5">{LABELS[l.action] || l.action}</span>
              <div className="min-w-0 flex-1">
                <span className="font-medium">{l.staff_username}</span>
                <span className="text-slate-400"> → {l.target || '—'} · {l.detail}</span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">{new Date(l.created_date).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}