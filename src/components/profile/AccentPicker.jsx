import { Check } from 'lucide-react';

const ACCENTS = [
  { value: 'cyan', label: 'Ocean', cls: 'bg-cyan-400' },
  { value: 'violet', label: 'Violet', cls: 'bg-violet-400' },
  { value: 'emerald', label: 'Emerald', cls: 'bg-emerald-400' },
  { value: 'rose', label: 'Rose', cls: 'bg-rose-400' },
  { value: 'amber', label: 'Gold', cls: 'bg-amber-400' },
];

export default function AccentPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ACCENTS.map((a) => (
        <button key={a.value} type="button" onClick={() => onChange(a.value)} className="flex flex-col items-center gap-1.5">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${a.cls} ring-offset-2 ring-offset-slate-950 transition-all ${value === a.value ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}>
            {value === a.value && <Check className="h-5 w-5 text-slate-950" />}
          </span>
          <span className="text-[11px] text-slate-400">{a.label}</span>
        </button>
      ))}
    </div>
  );
}