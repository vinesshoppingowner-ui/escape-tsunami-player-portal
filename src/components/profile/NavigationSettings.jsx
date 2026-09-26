import { Compass } from 'lucide-react';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';
import SegmentedSetting from '@/components/profile/SegmentedSetting';

export default function NavigationSettings({ prefs, set, staff }) {
  const pages = [['/', 'Home'], ['/portal', 'Portal'], ['/my-appeals', 'Appeals'], ...(staff ? [['/admin', 'Staff']] : [])];
  return (
    <SettingsSection icon={Compass} title="Navigation" desc="Where you start and how the top bar behaves.">
      <SegmentedSetting label="Start page" hint="Where you land when you open the site" options={pages}
        value={prefs.landing_page} onChange={(landing_page) => set({ landing_page })} />
      <SettingToggle label="Auto-hide top bar" hint="Hides the nav while scrolling down, shows it when scrolling up"
        checked={prefs.auto_hide_nav} onChange={(v) => set({ auto_hide_nav: v })} />
    </SettingsSection>
  );
}