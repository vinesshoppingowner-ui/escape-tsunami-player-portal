import { QR_MODES } from '@/lib/qrActions';

/** Pick what the generated code should do. */
export default function QrModeSelector({ mode, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QR_MODES.map((item) => {
        const Icon = item.icon;
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors ${
              active
                ? 'border-cyan-400/60 bg-cyan-500/10'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
            }`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-400'}`} />
            <span className="min-w-0">
              <span className={`block text-xs font-semibold ${active ? 'text-white' : 'text-slate-200'}`}>{item.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{item.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}