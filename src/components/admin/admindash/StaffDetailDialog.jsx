import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const TABS = [['appeal_decision', 'Appeals decided'], ['moderation_issued', 'Moderations issued'], ['all', 'All actions']];

export default function StaffDetailDialog({ staff, onClose }) {
  const [tab, setTab] = useState('appeal_decision');
  const rows = staff ? staff.logs.filter((l) => tab === 'all' || l.action === tab) : [];

  return (
    <Dialog open={!!staff} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto border-white/10 bg-slate-950 text-white">
        {staff && (
          <>
            <DialogTitle className="font-display">{staff.name}</DialogTitle>
            <DialogDescription className="text-slate-400 -mt-2">
              {staff.decisions} appeals decided · {staff.approved} approved · {staff.denied} denied · {staff.mods} moderations
            </DialogDescription>
            <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
              {TABS.map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded-md text-xs font-medium ${tab === k ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            {rows.length === 0 ? <p className="text-sm text-slate-500 py-6 text-center">Nothing here yet.</p> : (
              <div className="rounded-xl border border-white/10 divide-y divide-white/5">
                {rows.map((l) => (
                  <div key={l.id} className="px-3 py-2 text-sm flex gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-white">{l.target || '—'}</span>
                      <span className="text-slate-400"> · {l.detail}</span>
                      {l.undone && <span className="ml-1 text-[10px] text-rose-300">(undone)</span>}
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">{new Date(l.created_date).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}