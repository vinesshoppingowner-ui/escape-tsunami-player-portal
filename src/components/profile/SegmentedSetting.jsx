export default function SegmentedSetting({ label, hint, options, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-slate-200">
      <span>
        {label}
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <div className="flex shrink-0 rounded-lg border border-white/10 bg-slate-900/60 p-0.5">
        {options.map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${value === v ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}