import { useState } from 'react';
import { X } from 'lucide-react';

const HEX = /^#[0-9a-fA-F]{6}$/;
const norm = (v) => (v.startsWith('#') ? v : `#${v}`).slice(0, 7);

function HexRow({ label, value, onChange, onClear }) {
  const valid = HEX.test(value);
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-9 w-9 shrink-0 rounded-md border border-white/15 cursor-pointer overflow-hidden"
        style={{ background: valid ? value : 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 50% / 10px 10px' }}>
        <input type="color" value={valid ? value : '#131722'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
        <input value={value} onChange={(e) => onChange(norm(e.target.value))} placeholder="#000000" maxLength={7}
          className={`w-full h-8 rounded-md bg-slate-900/60 border px-2 font-mono text-sm uppercase text-white outline-none focus:ring-1 focus:ring-cyan-500 ${value && !valid ? 'border-rose-500/60' : 'border-white/10'}`} />
      </div>
      {onClear && value && (
        <button type="button" onClick={onClear} className="mt-4 p-1.5 text-slate-500 hover:text-white" aria-label="Remove color"><X className="h-4 w-4" /></button>
      )}
    </div>
  );
}

export default function CustomColorPanel({ prefs, set }) {
  const [c1, setC1] = useState(prefs.background_color || '#131722');
  const [c2, setC2] = useState(prefs.background_color2 || '');
  const ok = HEX.test(c1) && (!c2 || HEX.test(c2));
  const preview = HEX.test(c1) ? (HEX.test(c2) ? `linear-gradient(135deg, ${c1}, ${c2})` : c1) : '#131722';

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/40 p-4 space-y-3">
      <div className="h-14 rounded-md border border-white/10" style={{ background: preview }} />
      <div className="grid sm:grid-cols-2 gap-3">
        <HexRow label="Color 1" value={c1} onChange={setC1} />
        <HexRow label="Color 2 (optional)" value={c2} onChange={setC2} onClear={() => setC2('')} />
      </div>
      <div className="flex justify-end">
        <button type="button" disabled={!ok} onClick={() => set({ background: 'custom_color', background_color: c1, background_color2: c2 })}
          className="h-8 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white disabled:opacity-40">
          Apply colors
        </button>
      </div>
    </div>
  );
}