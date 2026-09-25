import { Switch } from '@/components/ui/switch';

export default function SettingToggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm text-slate-200 cursor-pointer">
      <span>
        {label}
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <Switch checked={!!checked} onCheckedChange={onChange} className="shrink-0 data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-cyan-500" />
    </label>
  );
}