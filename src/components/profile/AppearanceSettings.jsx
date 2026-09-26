import { Type } from 'lucide-react';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';
import SegmentedSetting from '@/components/profile/SegmentedSetting';
import { FONT_PAIRS } from '@/lib/themeExtras';

const FONTS = Object.entries(FONT_PAIRS).map(([v, f]) => [v, f.label]);
const CORNERS = [['sharp', 'Sharp'], ['default', 'Default'], ['round', 'Round']];

export default function AppearanceSettings({ prefs, set }) {
  return (
    <SettingsSection icon={Type} title="Style" desc="Fonts, corners and contrast.">
      <SegmentedSetting label="Font" options={FONTS} value={prefs.font_pair} onChange={(font_pair) => set({ font_pair })} />
      <SegmentedSetting label="Corners" options={CORNERS} value={prefs.corner_style} onChange={(corner_style) => set({ corner_style })} />
      <SettingToggle label="High contrast" hint="Brighter text and stronger borders" checked={prefs.high_contrast} onChange={(v) => set({ high_contrast: v })} />
    </SettingsSection>
  );
}