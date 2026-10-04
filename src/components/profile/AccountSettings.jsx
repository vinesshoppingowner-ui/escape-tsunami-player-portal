import { useState } from 'react';
import { UserCog, Download, RotateCcw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SettingsSection from '@/components/profile/SettingsSection';
import { DEFAULT_PREFS } from '@/lib/userPrefs';
import LoginOptions from '@/components/profile/LoginOptions';

const btn = 'inline-flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 text-sm text-slate-200 hover:bg-white/5 hover:border-white/20 disabled:opacity-40';

export default function AccountSettings({ user, set }) {
  const [exporting, setExporting] = useState(false);
  const username = user?.roblox_username;

  const exportData = async () => {
    setExporting(true);
    const [moderations, appeals] = await Promise.all([
      base44.entities.Moderation.filter({ roblox_username: username }),
      base44.entities.Appeal.filter({ roblox_username: username }),
    ]);
    const blob = new Blob([JSON.stringify({ roblox_username: username, exported_at: new Date().toISOString(), moderations, appeals }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `escape-tsunami-${username}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setExporting(false);
  };

  const reset = () => {
    if (window.confirm('Reset all settings to default?')) set(DEFAULT_PREFS);
  };

  return (
    <SettingsSection icon={UserCog} title="Account" desc="Your data and settings.">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportData} disabled={!username || exporting} className={btn}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export my data
        </button>
        <button type="button" onClick={reset} className={btn}>
          <RotateCcw className="h-4 w-4" /> Reset settings
        </button>
      </div>
      {!username && <p className="text-xs text-slate-500">Verify your Roblox account to export your moderation history.</p>}
      <LoginOptions user={user} />
    </SettingsSection>
  );
}