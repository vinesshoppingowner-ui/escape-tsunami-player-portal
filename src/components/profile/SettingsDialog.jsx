import { useState } from 'react';
import { Palette, User, Bell, Lock, Type, Image, CloudRain, Droplets, Monitor, Compass, Snowflake } from 'lucide-react';
import BackgroundEffectPicker from '@/components/profile/BackgroundEffectPicker';
import { canUseBgEffects } from '@/lib/backgroundEffects';
import BackgroundPicker from '@/components/profile/BackgroundPicker';
import GlassSlider from '@/components/profile/GlassSlider';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs, savePrefs } from '@/lib/userPrefs';
import AccentPicker from '@/components/profile/AccentPicker';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';
import DisplaySettings from '@/components/profile/DisplaySettings';
import NotificationSettings from '@/components/profile/NotificationSettings';
import PrivacySettings from '@/components/profile/PrivacySettings';
import AccentHexInput from '@/components/profile/AccentHexInput';
import AppearanceSettings from '@/components/profile/AppearanceSettings';
import NavigationSettings from '@/components/profile/NavigationSettings';
import AccountSettings from '@/components/profile/AccountSettings';

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
];

export default function SettingsDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const { toast } = useToast();
  const [tab, setTab] = useState('appearance');

  const set = async (patch) => {
    await savePrefs(user, patch);
    toast({ title: 'Settings saved' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 border-white/10 bg-slate-950 text-white overflow-hidden">
        <DialogTitle className="font-display text-xl px-6 pt-6 pb-2">Settings</DialogTitle>
        <DialogDescription className="px-6 pb-3 text-slate-400 -mt-1">Changes save automatically to your account.</DialogDescription>
        <div className="flex border-t border-white/[0.06] min-h-[420px]">
          {/* Sidebar */}
          <nav className="w-44 shrink-0 border-r border-white/[0.06] p-2 space-y-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  tab === t.id ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <t.icon className={`h-4 w-4 ${tab === t.id ? 'text-cyan-300' : 'text-slate-500'}`} />
                {t.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {tab === 'appearance' && (
              <>
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
                <SettingsSection icon={Snowflake} title="Effects">
                  <SettingToggle label="Show seasonal effects (snow, sparkles)" checked={prefs.seasonal_effects} onChange={(v) => set({ seasonal_effects: v })} />
                </SettingsSection>
              </>
            )}
            {tab === 'account' && (
              <>
                {user && <AccountSettings user={user} set={set} />}
                {user && <NavigationSettings prefs={prefs} set={set} />}
              </>
            )}
            {tab === 'notifications' && <NotificationSettings prefs={prefs} set={set} />}
            {tab === 'privacy' && user && <PrivacySettings prefs={prefs} set={set} user={user} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}