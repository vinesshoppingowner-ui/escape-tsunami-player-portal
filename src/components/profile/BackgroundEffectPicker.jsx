import { BG_EFFECTS } from '@/lib/backgroundEffects';

export default function BackgroundEffectPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {Object.entries(BG_EFFECTS).map(([key, fx]) => {
        const active = (value || 'none') === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-colors ${
              active ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            <span className="text-lg leading-none">{fx.icon}</span>
            {fx.label}
          </button>
        );
      })}
    </div>
  );
}