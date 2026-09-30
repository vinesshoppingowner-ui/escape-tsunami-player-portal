import { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import EvidenceDialog from '@/components/moderations/EvidenceDialog';

export const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_96px] sm:grid-cols-[minmax(0,1.8fr)_1fr_1fr_1fr_96px] items-center gap-3';

const TYPE_BADGE = {
  Warning: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  Mute: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  Kick: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  'Temporary Ban': 'bg-red-500/10 text-red-300 border-red-500/20',
  'Permanent Ban': 'bg-red-500/15 text-red-300 border-red-500/30',
};
const STATUS_PILL = {
  Active: 'bg-rose-500/10 text-rose-300 [&>span]:bg-rose-400',
  Expired: 'bg-slate-500/10 text-slate-400 [&>span]:bg-slate-500',
  Repealed: 'bg-emerald-500/10 text-emerald-300 [&>span]:bg-emerald-400',
};
const APPEAL_PILL = {
  Pending: 'bg-amber-500/10 text-amber-300 [&>span]:bg-amber-400',
  'Under Review': 'bg-sky-500/10 text-sky-300 [&>span]:bg-sky-400',
  Approved: 'bg-emerald-500/10 text-emerald-300 [&>span]:bg-emerald-400',
  Denied: 'bg-rose-500/10 text-rose-300 [&>span]:bg-rose-400',
};

const Pill = ({ cls, children }) => (
  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${cls}`}>
    <span className="h-1.5 w-1.5 rounded-full" />{children}
  </span>
);

export default function ModerationRow({ moderation: m, appeal, onAppeal, appealsLocked }) {
  const [open, setOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const hasEvidence = (m.evidence_type === 'chat_log' && m.evidence_text) || (m.evidence_type === 'screenshot' && m.evidence_image_url);
  const date = m.moderation_date ? new Date(m.moderation_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const isDenied = appeal?.status === 'Denied';
  const canAppeal = !appealsLocked && (!appeal || (isDenied && appeal.can_reappeal !== false && !(appeal.reappeal_after && new Date(appeal.reappeal_after) > new Date())));

  return (
    <div className="border-b border-slate-800/70 last:border-0">
      <div className={`${ROW_GRID} px-4 py-3 hover:bg-white/[0.02] transition-colors`}>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 text-left min-w-0">
          <ChevronDown className={`h-3.5 w-3.5 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[11px] font-medium ${TYPE_BADGE[m.moderation_type] || TYPE_BADGE.Warning}`}>{m.moderation_type}</span>
          <span className="text-sm text-slate-300 truncate">{m.reason}</span>
        </button>
        <div className="hidden sm:block text-xs text-slate-400">{date}{m.duration ? ` · ${m.duration}` : ''}</div>
        <div className="hidden sm:block"><Pill cls={STATUS_PILL[m.status] || STATUS_PILL.Expired}>{m.status}</Pill></div>
        <div className="hidden sm:block">
          {appeal ? <Pill cls={APPEAL_PILL[appeal.status]}>{appeal.status}</Pill> : <span className="text-xs text-slate-500">None</span>}
        </div>
        <div className="flex justify-end">
          {canAppeal ? (
            <button onClick={onAppeal} className="h-8 px-3 rounded-md border border-slate-700 bg-transparent text-xs font-medium text-white hover:bg-white/[0.06] hover:border-slate-500 transition-colors">
              {isDenied ? 'Re-appeal' : 'Appeal'}
            </button>
          ) : (
            <span className="text-xs text-slate-500">{appealsLocked ? 'Locked' : '—'}</span>
          )}
        </div>
      </div>
      {open && (
        <div className="mx-4 mb-3 p-4 rounded-md bg-slate-900/50 border-l-2 border-cyan-500 space-y-2 text-xs text-slate-400">
          <div className="sm:hidden flex flex-wrap items-center gap-2">
            <Pill cls={STATUS_PILL[m.status] || STATUS_PILL.Expired}>{m.status}</Pill> {date}
          </div>
          {m.details && <p className="text-sm text-slate-300 leading-relaxed">{m.details}</p>}
          {m.staff_member && <div>Issued by <span className="text-slate-300">{m.staff_member}</span></div>}
          {appeal?.staff_response && <p className="italic">Staff: “{appeal.staff_response}”</p>}
          {hasEvidence && (
            <button onClick={() => setEvidenceOpen(true)} className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200">
              <FileText className="h-3.5 w-3.5" /> View evidence
            </button>
          )}
          {!m.details && !m.staff_member && !appeal?.staff_response && !hasEvidence && <p>No additional details.</p>}
        </div>
      )}
      <EvidenceDialog open={evidenceOpen} onClose={() => setEvidenceOpen(false)} moderation={m} />
    </div>
  );
}