import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { RESPONSE_STATUS } from '@/lib/applicationTypes';

export default function ResponseBulkBar({ selected, responses, onDone, onClear }) {
  const [busy, setBusy] = useState(false);
  const apply = async (fields) => {
    setBusy(true);
    const items = selected.map((id) => ({ id, ...fields }));
    await base44.entities.ApplicationResponse.bulkUpdate(items);
    onDone(responses.filter((r) => selected.includes(r.id)).map((r) => ({ ...r, ...fields })));
    setBusy(false);
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
      <span className="text-xs text-cyan-200 mr-1">{selected.length} selected</span>
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />}
      {Object.entries(RESPONSE_STATUS).map(([k, s]) => (
        <button key={k} disabled={busy} onClick={() => apply({ status: k })} className={`px-2.5 h-7 rounded-md text-xs border ${s.cls}`}>Mark {s.label}</button>
      ))}
      <button disabled={busy} onClick={() => apply({ starred: true })} className="px-2.5 h-7 rounded-md text-xs border border-amber-500/30 text-amber-200">★ Shortlist</button>
      <button onClick={onClear} className="ml-auto text-xs text-slate-400 hover:text-white">Clear</button>
    </div>
  );
}