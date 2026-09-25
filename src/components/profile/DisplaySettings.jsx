import { Monitor } from 'lucide-react';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';

const SIZES = [['small', 'Small'], ['normal', 'Normal'], ['large', 'Large']];

export default function DisplaySettings({ prefs, set }) {
  return (
    <SettingsSection icon={Monitor} title="Display & layout" desc="Text size, spacing and motion.">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-200">
        Text size
        <div className="flex rounded-lg border border-white/10 bg-slate-900/60 p-0.5">
          {SIZES.map(([v, l]) => (
            <button key={v} type="button" onClick={() => set({ font_size: v })}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${prefs.font_size === v ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <SettingToggle label="Compact mode" hint="Tighter spacing to fit more on screen" checked={prefs.compact_mode} onChange={(v) => set({ compact_mode: v })} />
      <SettingToggle label="Reduce motion" hint="Turns off animations and seasonal effects" checked={prefs.reduce_motion} onChange={(v) => set({ reduce_motion: v })} />
    </SettingsSection>
  );
}