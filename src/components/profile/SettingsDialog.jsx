import { useState, useEffect, useRef } from 'react';
import {
  Palette, User, Bell, Lock, Image, CloudRain, Droplets, Snowflake,
  Settings as SettingsIcon, Type, Monitor, Compass, UserCog, Download,
  RotateCcw, Loader2, Copy, Check, ShieldCheck, Calendar, Globe, Hash,
  Mail, Shield, Trash2, KeyRound, Camera, Sparkles, ImagePlus, Pipette, X, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useUserPrefs, savePrefs, DEFAULT_PREFS } from '@/lib/userPrefs';
import { canUseBgEffects, BG_EFFECTS } from '@/lib/backgroundEffects';
import { BACKGROUNDS } from '@/lib/backgrounds';
import { FONT_PAIRS, HEX_RE } from '@/lib/themeExtras';
import { isOwner } from '@/lib/isOwner';
import { isRememberEnabled, setRememberEnabled } from '@/lib/savedLogin';
import {
  savePasscodeLogin, clearPasscodeLogin, getPasscodeLogin,
  refreshPasscodeToken, syncPasscodeToServer, clearServerPasscode
} from '@/lib/passcodeLogin';
import PasscodeKeypad from '@/components/profile/PasscodeKeypad';
import UserAvatar, { clearAvatarCache } from '@/components/profile/UserAvatar';
import { RING_STYLE } from '@/components/profile/ProfileMenu';

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'account', label: 'Account & Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
];

const ACCENTS = [
  { value: 'cyan', label: 'Ocean', cls: 'bg-[#22d3ee]' },
  { value: 'violet', label: 'Violet', cls: 'bg-violet-400' },
  { value: 'emerald', label: 'Emerald', cls: 'bg-emerald-400' },
  { value: 'rose', label: 'Rose', cls: 'bg-rose-400' },
  { value: 'amber', label: 'Gold', cls: 'bg-amber-400' },
];

const FONTS = Object.entries(FONT_PAIRS).map(([v, f]) => [v, f.label]);
const CORNERS = [['sharp', 'Sharp'], ['default', 'Default'], ['round', 'Round']];
const SIZES = [['small', 'Small'], ['normal', 'Normal'], ['large', 'Large']];
const START_PAGES = [['/', 'Home'], ['/portal', 'Portal'], ['/my-appeals', 'Appeals']];
const normHex = (v) => (v.startsWith('#') ? v : `#${v}`).slice(0, 7);

export default function SettingsDialog({ open, onOpenChange, defaultTab = 'appearance' }) {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const { toast } = useToast();
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (open && defaultTab) setTab(defaultTab);
  }, [open, defaultTab]);

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
                <AppearanceTab user={user} prefs={prefs} set={set} />
              )}
              {tab === 'account' && (
                <AccountTab user={user} prefs={prefs} set={set} />
              )}
              {tab === 'notifications' && (
                <NotificationsTab prefs={prefs} set={set} />
              )}
              {tab === 'privacy' && user && (
                <PrivacyTab user={user} prefs={prefs} set={set} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
 * SHARED UI PRIMITIVES
 * ============================================================================ */

function SettingsCard({ icon: Icon, title, desc, badge, children }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {badge}
      </div>
      {desc && <p className="text-xs text-slate-500 mb-3">{desc}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingToggle({ label, hint, checked, onChange }) {
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

function SegmentedSetting({ label, hint, options, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-slate-200">
      <span>
        {label}
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <div className="flex shrink-0 rounded-lg border border-white/10 bg-slate-900/60 p-0.5">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              value === v ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * TAB 1: APPEARANCE
 * ============================================================================ */

function AppearanceTab({ user, prefs, set }) {
  const [customHex, setCustomHex] = useState(prefs.accent_hex || '#6366F1');
  const validHex = HEX_RE.test(customHex);

  return (
    <>
      {/* Theme Color */}
      <SettingsCard icon={Palette} title="Theme color" desc="Accent color used across the portal.">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button key={a.value} type="button" onClick={() => set({ accent: a.value })} className="flex flex-col items-center gap-1.5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${a.cls} ring-offset-2 ring-offset-slate-950 transition-all ${prefs.accent === a.value ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}>
                {prefs.accent === a.value && <Check className="h-5 w-5 text-slate-950" />}
              </span>
              <span className="text-[11px] text-slate-400">{a.label}</span>
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 rounded-lg border p-2 ${prefs.accent === 'custom' ? 'border-white/40' : 'border-white/10'} bg-slate-900/40`}>
          <label className="relative h-8 w-8 shrink-0 rounded-md border border-white/15 cursor-pointer overflow-hidden" style={{ background: validHex ? customHex : '#131722' }}>
            <input type="color" value={validHex ? customHex : '#6366f1'} onChange={(e) => setCustomHex(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <input
            value={customHex}
            onChange={(e) => setCustomHex(normHex(e.target.value))}
            maxLength={7}
            placeholder="#6366F1"
            className={`h-8 w-28 rounded-md bg-slate-900/60 border px-2 font-mono text-sm uppercase text-white outline-none focus:ring-1 focus:ring-cyan-500 ${validHex ? 'border-white/10' : 'border-rose-500/60'}`}
          />
          <button
            type="button"
            disabled={!validHex}
            onClick={() => set({ accent: 'custom', accent_hex: customHex })}
            className="ml-auto h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white disabled:opacity-40"
          >
            {prefs.accent === 'custom' ? 'Update' : 'Use custom'}
          </button>
        </div>
      </SettingsCard>

      {/* Style */}
      <SettingsCard icon={Type} title="Style" desc="Fonts, corners and contrast.">
        <SegmentedSetting label="Font" options={FONTS} value={prefs.font_pair} onChange={(font_pair) => set({ font_pair })} />
        <SegmentedSetting label="Corners" options={CORNERS} value={prefs.corner_style} onChange={(corner_style) => set({ corner_style })} />
        <SettingToggle label="High contrast" hint="Brighter text and stronger borders" checked={prefs.high_contrast} onChange={(v) => set({ high_contrast: v })} />
      </SettingsCard>

      {/* Background */}
      <SettingsCard
        icon={Image}
        title="Background"
        desc="Pick a background theme, or set your own color or image."
        badge={<span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">New</span>}
      >
        <BackgroundSection prefs={prefs} set={set} />
      </SettingsCard>

      {/* Background Effect (Owner) */}
      {canUseBgEffects(user) && (
        <SettingsCard
          icon={CloudRain}
          title="Background effect"
          desc="Animated weather and seasonal effects behind the page."
          badge={<span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-300">Only you</span>}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(BG_EFFECTS).map(([key, fx]) => {
              const active = (prefs.background_effect || 'none') === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set({ background_effect: key })}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-colors ${
                    active ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-lg leading-none">{fx.icon}</span>
                  {fx.label}
                </button>
              );
            })}
          </div>
        </SettingsCard>
      )}

      {/* Button Glass */}
      <SettingsCard icon={Droplets} title="Button glass" desc="How see-through the liquid glass buttons are.">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tinted</span>
            <span className="text-slate-200">{prefs.glass_transparency}% transparent</span>
            <span>Clear</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            defaultValue={[prefs.glass_transparency]}
            onValueCommit={([v]) => set({ glass_transparency: v })}
            className="[&_[role=slider]]:bg-white"
          />
        </div>
      </SettingsCard>

      {/* Display & Layout */}
      <SettingsCard icon={Monitor} title="Display & layout" desc="Text size, spacing and motion.">
        <SegmentedSetting label="Text size" options={SIZES} value={prefs.font_size} onChange={(font_size) => set({ font_size })} />
        <SettingToggle label="Compact mode" hint="Tighter spacing to fit more on screen" checked={prefs.compact_mode} onChange={(v) => set({ compact_mode: v })} />
        <SettingToggle label="Reduce motion" hint="Turns off animations and seasonal effects" checked={prefs.reduce_motion} onChange={(v) => set({ reduce_motion: v })} />
        <SettingToggle label="Click sounds" hint="Play a subtle sound when you click buttons and links" checked={prefs.click_sounds !== false} onChange={(v) => set({ click_sounds: v })} />
      </SettingsCard>

      {/* Seasonal Effects */}
      <SettingsCard icon={Snowflake} title="Effects">
        <SettingToggle label="Show seasonal effects (snow, sparkles)" checked={prefs.seasonal_effects} onChange={(v) => set({ seasonal_effects: v })} />
      </SettingsCard>
    </>
  );
}

function BackgroundSection({ prefs, set }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [c1, setC1] = useState(prefs.background_color || '#131722');
  const [c2, setC2] = useState(prefs.background_color2 || '');

  const current = prefs.background || 'default';
  const customCss = prefs.background_color
    ? (prefs.background_color2 ? `linear-gradient(135deg, ${prefs.background_color}, ${prefs.background_color2})` : prefs.background_color)
    : '#131722';

  const tile = (active) =>
    `relative h-16 w-full rounded-lg border overflow-hidden transition-all flex items-center justify-center ${
      active ? 'border-white ring-2 ring-white/40' : 'border-white/10 hover:border-white/30'
    }`;

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    await set({ background: 'custom_image', background_image: file_url });
    setUploading(false);
    e.target.value = '';
  };

  const okColors = HEX_RE.test(c1) && (!c2 || HEX_RE.test(c2));
  const previewGradient = HEX_RE.test(c1) ? (HEX_RE.test(c2) ? `linear-gradient(135deg, ${c1}, ${c2})` : c1) : '#131722';

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {BACKGROUNDS.map((b) => (
          <button key={b.value} type="button" onClick={() => set({ background: b.value })} className="flex flex-col gap-1.5">
            <span className={tile(current === b.value)} style={{ background: b.css }}>
              {current === b.value && <Check className="h-5 w-5 text-white" />}
            </span>
            <span className="text-[11px] text-slate-400">{b.label}</span>
          </button>
        ))}

        <button type="button" onClick={() => setShowCustom((s) => !s)} className="flex flex-col gap-1.5">
          <span className={tile(current === 'custom_color' || showCustom)} style={{ background: customCss }}>
            {current === 'custom_color' ? <Check className="h-5 w-5 text-white" /> : <Pipette className="h-5 w-5 text-slate-300" />}
          </span>
          <span className="text-[11px] text-slate-400">Custom color</span>
        </button>

        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex flex-col gap-1.5">
          <span
            className={tile(current === 'custom_image')}
            style={prefs.background_image ? { backgroundImage: `url("${prefs.background_image}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : current === 'custom_image' ? (
              <Check className="h-5 w-5 text-white drop-shadow" />
            ) : (
              <ImagePlus className="h-5 w-5 text-slate-300 drop-shadow" />
            )}
          </span>
          <span className="text-[11px] text-slate-400">{prefs.background_image ? 'Custom image' : 'Upload image'}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
      </div>

      {showCustom && (
        <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/40 p-4 space-y-3">
          <div className="h-14 rounded-md border border-white/10" style={{ background: previewGradient }} />
          <div className="grid sm:grid-cols-2 gap-3">
            <HexColorRow label="Color 1" value={c1} onChange={setC1} />
            <HexColorRow label="Color 2 (optional)" value={c2} onChange={setC2} onClear={() => setC2('')} />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!okColors}
              onClick={() => set({ background: 'custom_color', background_color: c1, background_color2: c2 })}
              className="h-8 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white disabled:opacity-40"
            >
              Apply colors
            </button>
          </div>
        </div>
      )}

      {current === 'custom_image' && prefs.background_image && (
        <div className="mt-4 grid sm:grid-cols-2 gap-4 rounded-lg border border-white/10 bg-slate-900/40 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Dim</span>
              <span className="text-slate-200">{prefs.background_dim ?? 65}%</span>
            </div>
            <Slider min={0} max={90} step={5} defaultValue={[prefs.background_dim ?? 65]} onValueCommit={([v]) => set({ background_dim: v })} className="[&_[role=slider]]:bg-white" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Blur</span>
              <span className="text-slate-200">{prefs.background_blur ?? 0}px</span>
            </div>
            <Slider min={0} max={20} step={1} defaultValue={[prefs.background_blur ?? 0]} onValueCommit={([v]) => set({ background_blur: v })} className="[&_[role=slider]]:bg-white" />
          </div>
        </div>
      )}
    </>
  );
}

function HexColorRow({ label, value, onChange, onClear }) {
  const valid = HEX_RE.test(value);
  return (
    <div className="flex items-center gap-2">
      <label
        className="relative h-9 w-9 shrink-0 rounded-md border border-white/15 cursor-pointer overflow-hidden"
        style={{ background: valid ? value : 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 50% / 10px 10px' }}
      >
        <input type="color" value={valid ? value : '#131722'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
        <input
          value={value}
          onChange={(e) => onChange(normHex(e.target.value))}
          placeholder="#000000"
          maxLength={7}
          className={`w-full h-8 rounded-md bg-slate-900/60 border px-2 font-mono text-sm uppercase text-white outline-none focus:ring-1 focus:ring-cyan-500 ${
            value && !valid ? 'border-rose-500/60' : 'border-white/10'
          }`}
        />
      </div>
      {onClear && value && (
        <button type="button" onClick={onClear} className="mt-4 p-1.5 text-slate-500 hover:text-white" aria-label="Remove color">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ============================================================================
 * TAB 2: ACCOUNT & PROFILE
 * ============================================================================ */

function AccountTab({ user, prefs, set }) {
  if (!user) return null;
  return (
    <>
      <ProfileCustomizationSection user={user} />
      <AccountDetailsSection user={user} set={set} />
      <QuickLoginSection user={user} />
      <SettingsCard icon={Compass} title="Navigation" desc="Where you start and how the top bar behaves.">
        <SegmentedSetting
          label="Start page"
          hint="Where you land when you open the site"
          options={START_PAGES}
          value={prefs.landing_page}
          onChange={(landing_page) => set({ landing_page })}
        />
        <SettingToggle
          label="Auto-hide top bar"
          hint="Hides the nav while scrolling down, shows it when scrolling up"
          checked={prefs.auto_hide_nav}
          onChange={(v) => set({ auto_hide_nav: v })}
        />
      </SettingsCard>
    </>
  );
}

function ProfileCustomizationSection({ user }) {
  const { checkUserAuth } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const initialName = user?.custom_display_name || user?.data?.custom_display_name || user?.full_name || '';
  const initialBio = user?.bio ?? user?.data?.bio ?? '';
  const currentAvatarUri = user?.avatar_uri || user?.data?.avatar_uri || '';

  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be under 5 MB', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.auth.updateMe({ avatar_uri: file_uri });
      await checkUserAuth();
      toast({ title: 'Profile picture updated' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      clearAvatarCache(currentAvatarUri);
      await base44.auth.updateMe({ avatar_uri: '' });
      await checkUserAuth();
      toast({ title: 'Profile picture removed' });
    } catch (err) {
      toast({ title: 'Failed to remove avatar', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({
        custom_display_name: displayName.trim(),
        bio: bio.trim(),
      });
      await checkUserAuth();
      toast({ title: 'Profile saved' });
    } catch (err) {
      toast({ title: 'Failed to save profile', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-cyan-300" /> Public Profile & Avatar
        </h3>
        <p className="text-xs text-slate-500">Customize your portal profile picture and bio description.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative group shrink-0">
          <div className="p-[3px] rounded-full" style={RING_STYLE}>
            <UserAvatar user={user} size={64} />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            title="Upload custom PFP"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-cyan-300" /> : <Camera className="h-5 w-5 text-cyan-300" />}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-xs font-medium text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              {currentAvatarUri ? 'Change PFP' : 'Upload custom PFP'}
            </button>
            {currentAvatarUri && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Reset to Roblox avatar
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">PNG, JPG, WEBP or GIF up to 5 MB (stored privately).</p>
        </div>
      </div>

      <div className="grid gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
          <input
            type="text"
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={user?.roblox_username || user?.email || 'Your display name'}
            className="w-full h-9 px-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">Profile Description / Bio</label>
            <span className="text-[11px] text-slate-500">{bio.length}/160</span>
          </div>
          <textarea
            rows={2}
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio, role, or status message..."
            className="w-full p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}

function AccountDetailsSection({ user, set }) {
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [remember, setRemember] = useState(isRememberEnabled());
  const [sendingPw, setSendingPw] = useState(false);
  const [sentPw, setSentPw] = useState(false);

  const username = user?.roblox_username || user?.data?.roblox_username;
  const lastSeen = user?.last_seen || user?.data?.last_seen;
  const lastIp = user?.last_ip || user?.data?.last_ip;
  const roleLabel = isOwner(user) ? 'Owner' : user?.role === 'staff' ? 'Staff' : user?.role === 'admin' ? 'Administrator' : 'Member';
  const btn = 'inline-flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 text-sm text-slate-200 hover:bg-white/5 hover:border-white/20 disabled:opacity-40';

  const copyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const exportData = async () => {
    setExporting(true);
    const [moderations, appeals, applications] = await Promise.all([
      username ? base44.entities.Moderation.filter({ roblox_username: username }) : Promise.resolve([]),
      username ? base44.entities.Appeal.filter({ roblox_username: username }) : Promise.resolve([]),
      base44.entities.ApplicationResponse.filter({ submitted_by_email: user?.email }),
    ]);
    const payload = {
      account: {
        id: user?.id,
        email: user?.email,
        display_name: user?.custom_display_name || user?.data?.custom_display_name || user?.full_name,
        bio: user?.bio || user?.data?.bio || '',
        roblox_username: username || null,
        role: roleLabel,
        created_date: user?.created_date,
      },
      exported_at: new Date().toISOString(),
      moderations: moderations?.items || moderations || [],
      appeals: appeals?.items || appeals || [],
      application_responses: applications?.items || applications || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `escape-tsunami-${username || user?.id || 'account'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setExporting(false);
  };

  const reset = () => {
    if (window.confirm('Reset all settings to default?')) set(DEFAULT_PREFS);
  };

  const toggleRemember = (on) => {
    setRememberEnabled(on, user?.email || '');
    setRemember(on);
  };

  const requestPassword = async () => {
    setSendingPw(true);
    await base44.auth.resetPasswordRequest(user.email).catch(() => {});
    setSendingPw(false);
    setSentPw(true);
  };

  return (
    <SettingsCard icon={UserCog} title="Account Details & Security" desc="Your portal account identifiers, verification status, and data.">
      <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-lg bg-slate-900/70 border border-white/5 p-3">
          <div className="text-slate-500 flex items-center gap-1.5 mb-1"><Mail className="h-3.5 w-3.5" /> Email Address</div>
          <div className="font-medium text-white truncate">{user?.email || '—'}</div>
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-white/5 p-3">
          <div className="text-slate-500 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> Account ID</span>
            {user?.id && (
              <button type="button" onClick={copyId} className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[11px]">
                {copiedId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copiedId ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div className="font-mono text-slate-300 truncate">{user?.id || '—'}</div>
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-white/5 p-3">
          <div className="text-slate-500 flex items-center gap-1.5 mb-1"><ShieldCheck className="h-3.5 w-3.5" /> Roblox Verification</div>
          {username ? (
            <div className="font-medium text-emerald-300 flex items-center gap-1.5">
              <span>Verified as @{username}</span>
            </div>
          ) : (
            <a href="/portal" className="font-medium text-amber-300 hover:underline">Not linked — Verify in Portal →</a>
          )}
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-white/5 p-3">
          <div className="text-slate-500 flex items-center gap-1.5 mb-1"><Calendar className="h-3.5 w-3.5" /> Member Since & Role</div>
          <div className="font-medium text-white">
            {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Active'} · <span className="text-cyan-300">{roleLabel}</span>
          </div>
        </div>
        {(lastSeen || lastIp) && (
          <div className="sm:col-span-2 rounded-lg bg-slate-900/70 border border-white/5 p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>Last active session: <strong className="text-slate-200">{lastSeen ? new Date(lastSeen).toLocaleString() : 'Just now'}</strong></span>
            </div>
            {lastIp && <span className="font-mono text-[11px] text-slate-500">IP: {lastIp}</span>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={exportData} disabled={exporting} className={btn}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export my account data (JSON)
        </button>
        <button type="button" onClick={reset} className={btn}>
          <RotateCcw className="h-4 w-4" /> Reset preferences
        </button>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-4">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <span>
            <span className="block text-sm font-medium text-white">Auto-fill my login on this device</span>
            <span className="block text-xs text-slate-500">Fills in your email and password on the login page. Only applies to this browser.</span>
          </span>
          <Switch checked={remember} onCheckedChange={toggleRemember} />
        </label>
        <div>
          <p className="text-sm font-medium text-white">Email & password login</p>
          <p className="text-xs text-slate-500 mb-2">Signed up with Google? Set a password so you can also log in with {user?.email}.</p>
          <button
            type="button"
            onClick={requestPassword}
            disabled={sendingPw || sentPw || !user?.email}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
          >
            {sendingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {sentPw ? 'Check your email for the link' : 'Set / change password'}
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}

function QuickLoginSection({ user }) {
  const [mode, setMode] = useState(getPasscodeLogin() ? 'set' : 'new');
  const [firstCode, setFirstCode] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const existing = getPasscodeLogin();
  refreshPasscodeToken();

  const handleCreate = (code) => {
    if (mode === 'create') {
      setFirstCode(code);
      setMode('confirm');
      setError('');
    } else if (mode === 'confirm') {
      if (code !== firstCode) {
        setError('Codes do not match. Try again.');
        setFirstCode('');
        setMode('create');
        return;
      }
      const token = localStorage.getItem('base44_access_token');
      if (!token) {
        setError('No active session found.');
        return;
      }
      savePasscodeLogin(code, token, user?.email || '', user?.id || '');
      syncPasscodeToServer(code);
      setSaved(true);
      setMode('set');
      setFirstCode('');
      setError('');
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleRemove = () => {
    clearPasscodeLogin();
    clearServerPasscode();
    setMode('new');
    setError('');
  };

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white">Quick login passcode</h3>
        {existing && (
          <span className="ml-auto text-[10px] font-semibold uppercase text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Set a 4-digit code so you can log in from this device without typing your email and password.
      </p>

      {saved && (
        <div className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <Check className="h-3.5 w-3.5" /> Passcode saved! Use it on the login page next time.
        </div>
      )}

      {(mode === 'create' || mode === 'confirm') && (
        <div className="py-2">
          <PasscodeKeypad
            key={mode}
            onComplete={handleCreate}
            title={mode === 'create' ? 'Enter a 4-digit code' : 'Confirm your code'}
            subtitle={mode === 'create' ? 'Remember this — you will use it to log in' : 'Enter the same code again'}
          />
          {error && <p className="text-center text-xs text-rose-400 mt-3">{error}</p>}
          <button
            onClick={() => { setMode(existing ? 'set' : 'new'); setFirstCode(''); setError(''); }}
            className="mt-3 mx-auto block text-xs text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'set' && existing && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('create')}
            className="flex-1 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
          >
            Change passcode
          </button>
          <button
            onClick={handleRemove}
            className="h-9 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      )}

      {mode === 'new' && !existing && (
        <button
          onClick={() => setMode('create')}
          className="w-full h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold"
        >
          Set up passcode
        </button>
      )}
    </div>
  );
}

/* ============================================================================
 * TAB 3: NOTIFICATIONS
 * ============================================================================ */

function NotificationsTab({ prefs, set }) {
  const row = (key, label, hint) => (
    <SettingToggle key={key} label={label} hint={hint} checked={prefs[key]} onChange={(v) => set({ [key]: v })} />
  );
  return (
    <SettingsCard icon={Bell} title="Notifications" desc="Choose which alerts you get.">
      {row('notify_appeals', 'Appeal updates', 'When staff approve or deny your appeal')}
      {row('notify_moderations', 'Moderations', 'When a punishment is issued or expires')}
      {row('notify_staff_messages', 'Staff messages', 'Announcements and messages from staff')}
      {row('notification_sound', 'Play a sound', 'Short chime when a new notification arrives')}
      {row('welcome_popup', 'Welcome popup after logging in')}
    </SettingsCard>
  );
}

/* ============================================================================
 * TAB 4: PRIVACY
 * ============================================================================ */

function PrivacyTab({ user, prefs, set }) {
  const [exporting, setExporting] = useState(false);
  const btn = 'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors disabled:opacity-50';

  const exportData = async () => {
    setExporting(true);
    const name = user.roblox_username;
    const [moderations, appeals, notifications] = name
      ? await Promise.all([
          base44.entities.Moderation.filter({ roblox_username: name }),
          base44.entities.Appeal.filter({ roblox_username: name }),
          base44.entities.Notification.filter({ roblox_username: name }),
        ])
      : [[], [], []];
    const data = {
      account: { email: user.email, name: user.full_name, roblox_username: name || null },
      settings: prefs,
      moderations,
      appeals,
      notifications,
      exported_at: new Date().toISOString(),
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'escape-tsunami-my-data.json';
    a.click();
    setExporting(false);
  };

  return (
    <SettingsCard icon={Lock} title="Privacy & account" desc="Control what staff can see and manage your data.">
      <SettingToggle
        label="Hide my online status"
        hint="Staff won't see when you were last active"
        checked={prefs.hide_online_status}
        onChange={(v) => set({ hide_online_status: v })}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={exportData} disabled={exporting} className={`${btn} border-white/15 bg-white/5 text-slate-200 hover:text-white`}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download my data
        </button>
        <button type="button" onClick={() => base44.auth.logout('/')} className={`${btn} border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20`}>
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </SettingsCard>
  );
}