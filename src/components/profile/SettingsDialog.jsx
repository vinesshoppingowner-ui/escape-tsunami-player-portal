import { useState } from 'react';
import { Palette, User, Bell, Lock, Image, CloudRain, Droplets, Snowflake, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import QuickLoginSettings from '@/components/profile/QuickLoginSettings';

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
      <DialogContent className="max-w-[680px] max-h-[85vh] p-0 gap-0 border border-white/10 bg-[#0c0e16] text-white overflow-hidden flex flex-col rounded-2xl">
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              <SettingsIcon className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg leading-tight">Settings</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">Changes save automatically to your account.</DialogDescription>
            </div>
          </div>

          {/* Horizontal tab pills */}
          <div className="flex gap-1 mt-4 -mb-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="settings-tab-bg"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/10"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <t.icon className={`relative h-3.5 w-3.5 ${active ? 'text-cyan-300' : ''}`} />
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {tab === 'appearance' && (
                <>
                  <SettingsCard icon={Palette} title="Theme color" desc="Accent color used across the portal.">
                    <AccentPicker value={prefs.accent} onChange={(accent) => set({ accent })} />
                    <AccentHexInput active={prefs.accent === 'custom'} hex={prefs.accent_hex} onApply={(accent_hex) => set({ accent: 'custom', accent_hex })} />
                  </SettingsCard>
                  <AppearanceSettings prefs={prefs} set={set} />
                  <SettingsCard icon={Image} title="Background" desc="Pick a background theme, or set your own color or image."
                    badge={<span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">New</span>}>
                    <BackgroundPicker prefs={prefs} set={set} />
                  </SettingsCard>
                  {canUseBgEffects(user) && (
                    <SettingsCard icon={CloudRain} title="Background effect" desc="Animated weather and seasonal effects behind the page."
                      badge={<span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-300">Only you</span>}>
                      <BackgroundEffectPicker value={prefs.background_effect} onChange={(background_effect) => set({ background_effect })} />
                    </SettingsCard>
                  )}
                  <SettingsCard icon={Droplets} title="Button glass" desc="How see-through the liquid glass buttons are.">
                    <GlassSlider value={prefs.glass_transparency} onChange={(glass_transparency) => set({ glass_transparency })} />
                  </SettingsCard>
                  <DisplaySettings prefs={prefs} set={set} />
                  <SettingsCard icon={Snowflake} title="Effects">
                    <SettingToggle label="Show seasonal effects (snow, sparkles)" checked={prefs.seasonal_effects} onChange={(v) => set({ seasonal_effects: v })} />
                  </SettingsCard>
                </>
              )}
              {tab === 'account' && (
                <>
                  {user && <QuickLoginSettings user={user} />}
                  {user && <AccountSettings user={user} set={set} />}
                  {user && <NavigationSettings prefs={prefs} set={set} />}
                </>
              )}
              {tab === 'notifications' && <NotificationSettings prefs={prefs} set={set} />}
              {tab === 'privacy' && user && <PrivacySettings prefs={prefs} set={set} user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsCard({ icon: Icon, title, desc, badge, children }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {badge}
      </div>
      {desc && <p className="text-xs text-slate-500 mb-3">{desc}</p>}
      {children}
    </div>
  );
}