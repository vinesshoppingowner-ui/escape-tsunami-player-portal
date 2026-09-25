import { useState } from 'react';
import { Lock, Download, LogOut, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';

const btn = 'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors disabled:opacity-50';

export default function PrivacySettings({ prefs, set, user }) {
  const [exporting, setExporting] = useState(false);

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
    const data = { account: { email: user.email, name: user.full_name, roblox_username: name || null }, settings: prefs, moderations, appeals, notifications, exported_at: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'escape-tsunami-my-data.json';
    a.click();
    setExporting(false);
  };

  return (
    <SettingsSection icon={Lock} title="Privacy & account" desc="Control what staff can see and manage your data.">
      <SettingToggle label="Hide my online status" hint="Staff won't see when you were last active" checked={prefs.hide_online_status} onChange={(v) => set({ hide_online_status: v })} />
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={exportData} disabled={exporting} className={`${btn} border-white/15 bg-white/5 text-slate-200 hover:text-white`}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download my data
        </button>
        <button type="button" onClick={() => base44.auth.logout('/')} className={`${btn} border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20`}>
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </SettingsSection>
  );
}