import { Textarea } from '@/components/ui/textarea';

const WAITS = [['Immediately', 0], ['1 day', 1], ['3 days', 3], ['7 days', 7], ['14 days', 14], ['30 days', 30]];

export default function ReappealOptions({ draft, setDraft, field }) {
  const setWait = (days) => setDraft({ ...draft, can_reappeal: true, reappeal_after: days ? new Date(Date.now() + days * 86400000).toISOString() : '' });
  const activeDays = draft.reappeal_after ? Math.round((new Date(draft.reappeal_after) - Date.now()) / 86400000) : 0;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setWait(0)} className={`flex-1 h-8 rounded-md text-xs border ${draft.can_reappeal ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200' : 'border-slate-700 text-slate-400'}`}>Allow reappeal</button>
        <button type="button" onClick={() => setDraft({ ...draft, can_reappeal: false, reappeal_after: '' })} className={`flex-1 h-8 rounded-md text-xs border ${!draft.can_reappeal ? 'border-rose-500 bg-rose-500/15 text-rose-200' : 'border-slate-700 text-slate-400'}`}>Final — no reappeal</button>
      </div>
      {draft.can_reappeal && (
        <>
          <div>
            <p className="text-xs text-slate-400 mb-1.5">Can reappeal after</p>
            <div className="flex flex-wrap gap-1.5">
              {WAITS.map(([label, d]) => (
                <button key={label} type="button" onClick={() => setWait(d)} className={`px-2.5 h-7 rounded-md text-xs border ${Math.abs(activeDays - d) < 1 ? 'border-indigo-500 text-indigo-200 bg-indigo-500/10' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1.5">What should they include next time? (shown to player)</p>
            <Textarea rows={2} value={draft.reappeal_guidance || ''} onChange={(e) => setDraft({ ...draft, reappeal_guidance: e.target.value })} className={field} placeholder="e.g. Explain what you'll do differently and include a screenshot…" />
          </div>
        </>
      )}
    </div>
  );
}