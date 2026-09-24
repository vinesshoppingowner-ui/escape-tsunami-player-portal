import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ value, onChange, options, placeholder, className, buttonClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between w-full h-9 px-3 rounded-lg bg-slate-900/60 border text-sm text-white transition-colors ${open ? 'border-cyan-400/50' : 'border-white/15 hover:border-white/25'} ${buttonClassName || ''}`}
      >
        <span className={selected ? '' : 'text-slate-500'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-max rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden p-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex items-center justify-between gap-3 w-full px-2.5 py-2 rounded-lg text-sm transition-colors ${
                opt.value === value ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-cyan-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}