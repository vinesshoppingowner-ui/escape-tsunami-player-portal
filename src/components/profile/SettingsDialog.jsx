import { Palette, Bell, Snowflake, LayoutGrid, Droplets } from 'lucide-react';
import GlassSlider from '@/components/profile/GlassSlider';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { useUserPrefs, savePrefs } from '@/lib/userPrefs';
import AccentPicker from '@/components/profile/AccentPicker';
import AppealStylePicker from '@/components/profile/AppealStylePicker';

const switchCls = 'data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-cyan-500';

function Section({ icon: Icon, title, desc, children, badge }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-cyan-300" /> {title}{badge}</div>
      {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function SettingsDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const { toast } = useToast();
  const staff = isOwner(user) || user?.role === 'staff' || user?.role === 'admin';

  const set = async (patch) => {
    await savePrefs(user, patch);
    toast({ title: 'Settings saved' });
  };

  const toggleRow = (key, label) => (
    <label className="flex items-center justify-between text-sm text-slate-200">
      {label}
      <Switch checked={!!prefs[key]} onCheckedChange={(v) => set({ [key]: v })} className={switchCls} />
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto border-white/10 bg-slate-950 text-white">
        <DialogTitle className="font-display text-xl">Settings</DialogTitle>
        <DialogDescription className="text-slate-400 -mt-2">Changes save automatically to your account.</DialogDescription>
        <div className="space-y-3">
          <Section icon={Palette} title="Theme color" desc="Accent color used across the portal.">
            <AccentPicker value={prefs.accent} onChange={(accent) => set({ accent })} />
          </Section>
          <Section icon={Droplets} title="Button glass" desc="How see-through the liquid glass buttons are.">
            <GlassSlider value={prefs.glass_transparency} onChange={(glass_transparency) => set({ glass_transparency })} />
          </Section>
          <Section icon={Bell} title="Notifications">{toggleRow('welcome_popup', 'Show welcome popup after logging in')}</Section>
          <Section icon={Snowflake} title="Effects">{toggleRow('seasonal_effects', 'Show seasonal effects (snow, sparkles)')}</Section>
          {staff && (
            <Section icon={LayoutGrid} title="Appeal card style" desc="How appeals look in your staff queue."
              badge={<span className="ml-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">Staff only</span>}>
              <AppealStylePicker value={prefs.appeal_card_style} onChange={(appeal_card_style) => set({ appeal_card_style })} />
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}