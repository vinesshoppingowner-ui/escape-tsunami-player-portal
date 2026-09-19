import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import AppealReviewModal from '@/components/admin/AppealReviewModal';

const STATUS_STYLES = {
  'Pending': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Under Review': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Approved': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Denied': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const priorityFor = (mod) => {
  const t = mod?.moderation_type;
  if (t === 'Permanent Ban' || t === 'Temporary Ban') return { label: 'High', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
  if (t === 'Warning') return { label: 'Low', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  return { label: 'Medium', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
};

export default function AppealsTab() {
  const [appeals, setAppeals] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [apps, mods] = await Promise.all([
        base44.entities.Appeal.list('-created_date', 100),
        base44.entities.Moderation.list('-moderation_date', 100),
      ]);
      setAppeals(apps || []);
      setModerations(mods || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const modFor = (id) => moderations.find((m) => m.id === id);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading appeals…</div>;
  }
  if (!appeals.length) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center">
        <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-emerald-400/70" />
        <div className="text-sm text-slate-300">All caught up! No pending appeals right now.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400 mb-2">Click an appeal to review the full case — including chat logs and exploit detections.</p>
      {appeals.map((a) => {
        const mod = modFor(a.moderation_id);
        const priority = priorityFor(mod);
        return (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            className="w-full text-left rounded-2xl bg-white/[0.03] border border-white/10 p-4 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cyan-300 font-medium">{a.roblox_username}</span>
                  <span className="text-slate-500 text-sm">· {mod?.moderation_type || 'Moderation'}</span>
                  {mod?.reason && <span className="text-slate-500 text-sm hidden sm:inline">— {mod.reason}</span>}
                </div>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">{new Date(a.created_date).toLocaleString()}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priority.cls}`}>{priority.label} priority</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-400 truncate">{a.appeal_reason}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[a.status] || STATUS_STYLES['Pending']}`}>{a.status}</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
      <AppealReviewModal
        open={!!selected}
        onClose={() => setSelected(null)}
        appeal={selected}
        moderation={selected ? modFor(selected.moderation_id) : null}
        onSaved={load}
      />
    </div>
  );
}