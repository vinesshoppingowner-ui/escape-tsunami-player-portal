import { useState } from 'react';
import { HEX_RE } from '@/lib/themeExtras';

export default function AccentHexInput({ active, hex, onApply }) {
  const [value, setValue] = useState(hex || '#6366F1');
  const valid = HEX_RE.test(value);
  const norm = (v) => (v.startsWith('#') ? v : `#${v}`).slice(0, 7);

  return (
    <div className={`flex items-center gap-2 rounded-lg border p-2 ${active ? 'border-white/40' : 'border-white/10'} bg-slate-900/40`}>
      <label className="relative h-8 w-8 shrink-0 rounded-md border border-white/15 cursor-pointer overflow-hidden" style={{ background: valid ? value : '#131722' }}>
        <input type="color" value={valid ? value : '#6366f1'} onChange={(e) => setValue(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
      <input value={value} onChange={(e) => setValue(norm(e.target.value))} maxLength={7} placeholder="#6366F1"
        className={`h-8 w-28 rounded-md bg-slate-900/60 border px-2 font-mono text-sm uppercase text-white outline-none focus:ring-1 focus:ring-cyan-500 ${valid ? 'border-white/10' : 'border-rose-500/60'}`} />
      <button type="button" disabled={!valid} onClick={() => onApply(value)}
        className="ml-auto h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white disabled:opacity-40">
        {active ? 'Update' : 'Use custom'}
      </button>
    </div>
  );
}