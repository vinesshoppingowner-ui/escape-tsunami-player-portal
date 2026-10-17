import { useState } from 'react';
import { UserCog, Download, RotateCcw, Loader2, Copy, Check, ShieldCheck, Calendar, Globe, Hash, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SettingsSection from '@/components/profile/SettingsSection';
import { DEFAULT_PREFS } from '@/lib/userPrefs';
import LoginOptions from '@/components/profile/LoginOptions';
import { isOwner } from '@/lib/isOwner';

const btn = 'inline-flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 text-sm text-slate-200 hover:bg-white/5 hover:border-white/20 disabled:opacity-40';

export default function AccountSettings({ user, set }) {
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const username = user?.roblox_username || user?.data?.roblox_username;
  const lastSeen = user?.last_seen || user?.data?.last_seen;
  const lastIp = user?.last_ip || user?.data?.last_ip;
  const roleLabel = isOwner(user) ? 'Owner' : user?.role === 'staff' ? 'Staff' : user?.role === 'admin' ? 'Administrator' : 'Member';

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

  return (
    <SettingsSection icon={UserCog} title="Account Details & Security" desc="Your portal account identifiers, verification status, and data.">
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
      <LoginOptions user={user} />
    </SettingsSection>
  );
}