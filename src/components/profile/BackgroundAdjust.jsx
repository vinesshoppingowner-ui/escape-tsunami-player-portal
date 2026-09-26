import { Slider } from '@/components/ui/slider';

function Row({ label, value, unit, min, max, step, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span><span className="text-slate-200">{value}{unit}</span>
      </div>
      <Slider min={min} max={max} step={step} defaultValue={[value]} onValueCommit={([v]) => onChange(v)} className="[&_[role=slider]]:bg-white" />
    </div>
  );
}

// Dim / blur controls, shown when a custom image background is active.
export default function BackgroundAdjust({ prefs, set }) {
  return (
    <div className="mt-4 grid sm:grid-cols-2 gap-4 rounded-lg border border-white/10 bg-slate-900/40 p-4">
      <Row label="Dim" unit="%" min={0} max={90} step={5} value={prefs.background_dim ?? 65} onChange={(v) => set({ background_dim: v })} />
      <Row label="Blur" unit="px" min={0} max={20} step={1} value={prefs.background_blur ?? 0} onChange={(v) => set({ background_blur: v })} />
    </div>
  );
}