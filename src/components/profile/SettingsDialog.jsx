import { Palette, Snowflake, LayoutGrid, Droplets, Image, CloudRain } from 'lucide-react';
import BackgroundEffectPicker from '@/components/profile/BackgroundEffectPicker';
import { canUseBgEffects } from '@/lib/backgroundEffects';
import BackgroundPicker from '@/components/profile/BackgroundPicker';
import GlassSlider from '@/components/profile/GlassSlider';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { useUserPrefs, savePrefs } from '@/lib/userPrefs';
import AccentPicker from '@/components/profile/AccentPicker';
import AppealStylePicker from '@/components/profile/AppealStylePicker';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';
import DisplaySettings from '@/components/profile/DisplaySettings';
import NotificationSettings from '@/components/profile/NotificationSettings';
import PrivacySettings from '@/components/profile/PrivacySettings';
import AccentHexInput from '@/components/profile/AccentHexInput';
import AppearanceSettings from '@/components/profile/AppearanceSettings';
import NavigationSettings from '@/components/profile/NavigationSettings';
import AccountSettings from '@/components/profile/AccountSettings';

export default function SettingsDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const { toast } = useToast();
  const staff = isOwner(user) || user?.role === 'staff' || user?.role === 'admin';

  const set = async (patch) => {
    await savePrefs(user, patch);
    toast({ title: 'Settings saved' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto border-white/10 bg-slate-950 text-white">
        <DialogTitle className="font-display text-xl">Settings</DialogTitle>
        <DialogDescription className="text-slate-400 -mt-2">Changes save automatically to your account.</DialogDescription>
        <div className="space-y-3">
          <SettingsSection icon={Palette} title="Theme color" desc="Accent color used across the portal.">
            <AccentPicker value={prefs.accent} onChange={(accent) => set({ accent })} />
            <AccentHexInput active={prefs.accent === 'custom'} hex={prefs.accent_hex} onApply={(accent_hex) => set({ accent: 'custom', accent_hex })} />
          </SettingsSection>
          <AppearanceSettings prefs={prefs} set={set} />
          <SettingsSection icon={Image} title="Background" desc="Pick a background theme, or set your own color or image."
            badge={<span className="ml-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">New</span>}>
            <BackgroundPicker prefs={prefs} set={set} />
          </SettingsSection>
          {canUseBgEffects(user) && (
            <SettingsSection icon={CloudRain} title="Background effect" desc="Animated weather and seasonal effects behind the page."
              badge={<span className="ml-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-300">Only you</span>}>
              <BackgroundEffectPicker value={prefs.background_effect} onChange={(background_effect) => set({ background_effect })} />
            </SettingsSection>
          )}
          <SettingsSection icon={Droplets} title="Button glass" desc="How see-through the liquid glass buttons are.">
            <GlassSlider value={prefs.glass_transparency} onChange={(glass_transparency) => set({ glass_transparency })} />
          </SettingsSection>
          <DisplaySettings prefs={prefs} set={set} />
          {user && <NavigationSettings prefs={prefs} set={set} staff={staff} />}
          <NotificationSettings prefs={prefs} set={set} />
          <SettingsSection icon={Snowflake} title="Effects">
            <SettingToggle label="Show seasonal effects (snow, sparkles)" checked={prefs.seasonal_effects} onChange={(v) => set({ seasonal_effects: v })} />
          </SettingsSection>
          {user && <PrivacySettings prefs={prefs} set={set} user={user} />}
          {user && <AccountSettings user={user} set={set} />}
          {staff && (
            <SettingsSection icon={LayoutGrid} title="Appeal card style" desc="How appeals look in your staff queue."
              badge={<span className="ml-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">Staff only</span>}>
              <AppealStylePicker value={prefs.appeal_card_style} onChange={(appeal_card_style) => set({ appeal_card_style })} />
            </SettingsSection>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}