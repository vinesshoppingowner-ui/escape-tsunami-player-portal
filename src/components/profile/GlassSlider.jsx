import { Slider } from '@/components/ui/slider';

export default function GlassSlider({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Tinted</span><span className="text-slate-200">{value}% transparent</span><span>Clear</span>
      </div>
      <Slider min={0} max={100} step={5} defaultValue={[value]} onValueCommit={([v]) => onChange(v)} className="[&_[role=slider]]:bg-white" />
    </div>
  );
}