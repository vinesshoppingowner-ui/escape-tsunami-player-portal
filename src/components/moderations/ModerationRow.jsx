import { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EvidenceDialog from '@/components/moderations/EvidenceDialog';

const STATUS_DOT = { Active: 'bg-rose-500', Expired: 'bg-slate-500', Repealed: 'bg-emerald-500' };
const APPEAL_DOT = { Pending: 'bg-amber-400', 'Under Review': 'bg-sky-400', Approved: 'bg-emerald-400', Denied: 'bg-rose-400' };

export default function ModerationRow({ moderation: m, appeal, onAppeal, appealsLocked }) {
  const [open, setOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const hasEvidence = (m.evidence_type === 'chat_log' && m.evidence_text) || (m.evidence_type === 'screenshot' && m.evidence_image_url);
  const date = m.moderation_date ? new Date(m.moderation_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const isDenied = appeal?.status === 'Denied';
  const canAppeal = !appealsLocked && (!appeal || (isDenied && appeal.can_reappeal !== false));

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.6fr_1fr_0.9fr_1fr_auto] items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-left min-w-0">
          <ChevronDown className={`h-3.5 w-3.5 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          <div className="min-w-0">
            <div className="text-sm font-medium text-white">{m.moderation_type}</div>
            <div className="text-xs text-slate-400 truncate">{m.reason}</div>
          </div>
        </button>
        <div className="hidden sm:block text-xs text-slate-400">{date}{m.duration ? ` · ${m.duration}` : ''}</div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[m.status] || 'bg-slate-500'}`} /> {m.status}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          {appeal ? (<><span className={`h-1.5 w-1.5 rounded-full ${APPEAL_DOT[appeal.status]}`} /> {appeal.status}</>) : '—'}
        </div>
        <div className="flex justify-end">
          {canAppeal ? (
            <Button size="sm" onClick={onAppeal} className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              {isDenied ? 'Re-appeal' : 'Appeal'}
            </Button>
          ) : (
            <span className="text-xs text-slate-500">{appealsLocked ? 'Locked' : ''}</span>
          )}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 pl-10 space-y-2 text-xs text-slate-400">
          <div className="sm:hidden flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[m.status]}`} /> {m.status} · {date}</div>
          {m.details && <p className="text-sm text-slate-300 leading-relaxed">{m.details}</p>}
          {m.staff_member && <div>Issued by {m.staff_member}</div>}
          {appeal?.staff_response && <p className="italic">Staff: “{appeal.staff_response}”</p>}
          {hasEvidence && (
            <button onClick={() => setEvidenceOpen(true)} className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200">
              <FileText className="h-3.5 w-3.5" /> View evidence
            </button>
          )}
        </div>
      )}
      <EvidenceDialog open={evidenceOpen} onClose={() => setEvidenceOpen(false)} moderation={m} />
    </div>
  );
}