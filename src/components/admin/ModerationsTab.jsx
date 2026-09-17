import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logStaffAction } from '@/lib/staffLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Gavel, Copy, Search, RefreshCw, Bot, Clock, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { pushBan, pushUnban, syncAllBans } from '@/lib/renderBridge';
import { useToast } from '@/components/ui/use-toast';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const STATUSES = ['Active', 'Expired', 'Repealed'];
const DISCORD_ACTIONS = [
  { value: 'timeout', label: 'Timeout (mute)', needsDuration: true },
  { value: 'untimeout', label: 'Remove Timeout', needsDuration: false },
  { value: 'kick', label: 'Kick', needsDuration: false },
  { value: 'ban', label: 'Ban', needsDuration: false },
  { value: 'unban', label: 'Unban', needsDuration: false },
];
const DISCORD_STATUS_STYLES = {
  pending: { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock, label: 'Pending' },
  completed: { cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: CheckCircle2, label: 'Done' },
  failed: { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle, label: 'Failed' },
};
const empty = {
  platform: 'roblox',
  roblox_username: '',
  moderation_type: 'Warning',
  reason: '',
  details: '',
  duration: '',
  staff_member: '',
  status: 'Active',
  evidence_type: 'none',
  evidence_text: '',
  evidence_image_url: '',
  discord_user_id: '',
  discord_username: '',
  action_type: 'timeout',
  duration_minutes: 5,
};

export default function ModerationsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [discordList, setDiscordList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [mods, actions] = await Promise.all([
        base44.entities.Moderation.list('-moderation_date', 100),
        base44.entities.DiscordAction.list('-created_date', 50),
      ]);
      setList(mods || []);
      setDiscordList(actions || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    try {
      if (form.platform === 'discord') {
        if (!form.discord_user_id || !form.reason) return;
        await base44.entities.DiscordAction.create({
          discord_user_id: form.discord_user_id,
          discord_username: form.discord_username,
          action_type: form.action_type,
          reason: form.reason,
          duration_minutes: form.action_type === 'timeout' ? Number(form.duration_minutes) : undefined,
          status: 'pending',
          issued_by: user?.full_name || user?.email || 'Unknown staff',
        });
        await logStaffAction(user, 'moderation_issued', form.discord_username || form.discord_user_id, `Discord ${form.action_type} — ${form.reason}`);
        toast({ title: 'Discord action queued', description: 'Your bot will execute it within ~10 seconds.' });
      } else {
        if (!form.roblox_username || !form.reason) return;
        await base44.entities.Moderation.create({ ...form, moderation_date: new Date().toISOString() });
        await base44.entities.Notification.create({
          roblox_username: form.roblox_username,
          title: `New ${form.moderation_type} issued`,
          body: form.reason || 'A moderation action has been added to your account.',
          type: 'moderation_issued',
          read: false,
        });
        await logStaffAction(user, 'moderation_issued', form.roblox_username, `Issued ${form.moderation_type} — ${form.reason}`);

        if (form.moderation_type === 'Permanent Ban' || form.moderation_type === 'Temporary Ban') {
          try {
            await pushBan(form);
            toast({ title: 'Ban pushed to game server', description: `${form.roblox_username} is now banned in-game.` });
          } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to push ban to game', description: e.message });
          }
        }
      }

      setForm(empty);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m) => {
    await base44.entities.Moderation.delete(m.id);
    if (m.moderation_type === 'Permanent Ban' || m.moderation_type === 'Temporary Ban') {
      try {
        await pushUnban(m.roblox_username);
        toast({ title: 'Unban pushed to game server', description: `${m.roblox_username} is now unbanned in-game.` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Failed to push unban to game', description: e.message });
      }
    }
    await logStaffAction(user, 'moderation_deleted', m.roblox_username, `Deleted ${m.moderation_type} — ${m.reason}`);
    await load();
  };

  const syncBans = async () => {
    setSyncing(true);
    try {
      await syncAllBans(list);
      toast({ title: 'Bans synced to game server' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync failed', description: e.message });
    } finally {
      setSyncing(false);
    }
  };

  const copyForDiscord = () => {
    const text = [
      `**${form.moderation_type}** — ${form.roblox_username || 'Unknown'}`,
      `Reason: ${form.reason || '—'}`,
      form.duration && `Duration: ${form.duration}`,
      form.staff_member && `Staff: ${form.staff_member}`,
      form.details && `Details: ${form.details}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(text);
  };

  const usernames = Array.from(new Set(list.map((m) => m.roblox_username).filter(Boolean)));
  const q = query.trim().toLowerCase();
  const matchedUser = q ? usernames.find((u) => u.toLowerCase() === q) : null;
  const filtered = q
    ? matchedUser
      ? list.filter((m) => m.roblox_username === matchedUser)
      : list.filter((m) => (m.roblox_username || '').toLowerCase().includes(q))
    : list;

  const profile = matchedUser
    ? (() => {
        const um = list.filter((m) => m.roblox_username === matchedUser);
        const dates = um.map((m) => m.moderation_date).filter(Boolean).sort();
        return {
          username: matchedUser,
          total: um.length,
          bans: um.filter((m) => m.moderation_type.includes('Ban')).length,
          mutes: um.filter((m) => m.moderation_type === 'Mute').length,
          warnings: um.filter((m) => m.moderation_type === 'Warning').length,
          kicks: um.filter((m) => m.moderation_type === 'Kick').length,
          active: um.filter((m) => m.status === 'Active').length,
          since: dates[0] ? new Date(dates[0]).toLocaleDateString() : '—',
        };
      })()
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{list.length} moderation{list.length !== 1 ? 's' : ''} on record.</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={syncBans}
            disabled={syncing}
            className="bg-white/5 border-white/15 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} /> Sync bans to game
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm((s) => !s)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1.5" /> {showForm ? 'Cancel' : 'New moderation'}
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a Roblox username to see their history…"
          list="mod-usernames"
          className="bg-slate-950/60 border-white/15 text-white pl-9"
        />
        <datalist id="mod-usernames">
          {usernames.map((u) => <option key={u} value={u} />)}
        </datalist>
      </div>

      {profile && (
        <div className="mb-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <RobloxAvatar username={profile.username} size={48} />
            <div>
              <div className="text-white font-semibold">{profile.username}</div>
              <div className="text-xs text-slate-500">First moderation: {profile.since}</div>
            </div>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{profile.active} active</span>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Total', value: profile.total, cls: 'text-white' },
              { label: 'Bans', value: profile.bans, cls: 'text-rose-300' },
              { label: 'Mutes', value: profile.mutes, cls: 'text-slate-300' },
              { label: 'Kicks', value: profile.kicks, cls: 'text-orange-300' },
              { label: 'Warnings', value: profile.warnings, cls: 'text-amber-300' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-950/40 border border-white/5 p-2.5 text-center">
                <div className={`text-lg font-bold ${s.cls}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 mb-5 space-y-3">
          {/* Platform selector */}
          <div>
            <Label className="text-xs text-slate-400">Platform</Label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, platform: 'roblox' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.platform === 'roblox'
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-950/60 border-white/15 text-slate-400 hover:text-white'
                }`}
              >
                Roblox
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, platform: 'discord' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  form.platform === 'discord'
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950/60 border-white/15 text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="h-3.5 w-3.5" /> Discord
              </button>
            </div>
          </div>

          {form.platform === 'discord' ? (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-400">Discord user ID *</Label>
                  <Input value={form.discord_user_id} onChange={(e) => setForm({ ...form, discord_user_id: e.target.value })} placeholder="e.g. 123456789012345678" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Discord username (optional)</Label>
                  <Input value={form.discord_username} onChange={(e) => setForm({ ...form, discord_username: e.target.value })} placeholder="e.g. username" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Action type</Label>
                  <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-white/15 bg-slate-950/60 px-3 text-sm text-white">
                    {DISCORD_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                {form.action_type === 'timeout' && (
                  <div>
                    <Label className="text-xs text-slate-400">Duration (minutes)</Label>
                    <Input type="number" min="1" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-400">Reason *</Label>
                <Textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1" />
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-indigo-500/5 border border-indigo-500/15 p-3 text-xs text-slate-400">
                <Bot className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <span>Your Discord bot will pick this up and execute it within ~10 seconds.</span>
              </div>
              <div className="flex justify-end">
                <Button onClick={create} disabled={saving || !form.discord_user_id || !form.reason} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0">
                  {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Queuing</> : <><Bot className="h-4 w-4 mr-1.5" /> Queue Discord action</>}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-400">Roblox username *</Label>
                  <Input value={form.roblox_username} onChange={(e) => setForm({ ...form, roblox_username: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Type</Label>
                  <select value={form.moderation_type} onChange={(e) => setForm({ ...form, moderation_type: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-white/15 bg-slate-950/60 px-3 text-sm text-white">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Reason *</Label>
                  <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 24h, 7d, Permanent" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Staff member</Label>
                  <Input value={form.staff_member} onChange={(e) => setForm({ ...form, staff_member: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Status</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-white/15 bg-slate-950/60 px-3 text-sm text-white">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400">Details</Label>
                <Textarea rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-400">Evidence type</Label>
                  <select value={form.evidence_type} onChange={(e) => setForm({ ...form, evidence_type: e.target.value, evidence_text: '', evidence_image_url: '' })} className="mt-1 w-full h-9 rounded-md border border-white/15 bg-slate-950/60 px-3 text-sm text-white">
                    <option value="none">None</option>
                    <option value="chat_log">Chat log</option>
                    <option value="screenshot">Screenshot</option>
                  </select>
                </div>
                {form.evidence_type === 'chat_log' && (
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-400">Chat log</Label>
                    <Textarea rows={4} value={form.evidence_text} onChange={(e) => setForm({ ...form, evidence_text: e.target.value })} className="bg-slate-950/60 border-white/15 text-white mt-1 font-mono text-xs" placeholder="Paste the in-game chat log…" />
                  </div>
                )}
                {form.evidence_type === 'screenshot' && (
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-400">Screenshot URL</Label>
                    <Input value={form.evidence_image_url} onChange={(e) => setForm({ ...form, evidence_image_url: e.target.value })} placeholder="https://… image URL" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={copyForDiscord} className="bg-white/5 border-white/15 text-white hover:bg-white/10">
                  <Copy className="h-4 w-4 mr-1.5" /> Copy for Discord
                </Button>
                <Button onClick={create} disabled={saving || !form.roblox_username || !form.reason} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                  {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Issuing</> : <><Gavel className="h-4 w-4 mr-1.5" /> Issue moderation</>}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-400">
          {q ? `No moderations found for "${query}".` : 'No moderations issued yet.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="text-cyan-300 font-medium">{m.roblox_username}</span>
                  <span className="text-slate-500"> · {m.moderation_type}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{m.reason}{m.duration ? ` · ${m.duration}` : ''} · {m.status}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(m)} className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Discord actions section */}
      {discordList.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Discord actions</h3>
            <span className="text-xs text-slate-500">({discordList.length})</span>
          </div>
          <div className="space-y-2">
            {discordList.map((a) => {
              const st = DISCORD_STATUS_STYLES[a.status] || DISCORD_STATUS_STYLES.pending;
              const StatusIcon = st.icon;
              return (
                <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm">
                      <span className="text-indigo-300 font-medium">{a.discord_username || a.discord_user_id}</span>
                      <span className="text-slate-500"> · {a.action_type}{a.action_type === 'timeout' && a.duration_minutes ? ` (${a.duration_minutes}m)` : ''}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{a.reason}</div>
                    {a.status === 'failed' && a.result_message && (
                      <div className="mt-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 flex items-start gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-rose-300">
                          {/missing permissions|higher role|forbidden|403/i.test(a.result_message)
                            ? `Bot lacks permission — this user's role is higher than the bot's. Reorder roles or grant the bot higher permissions. (${a.result_message})`
                            : a.result_message}
                        </span>
                      </div>
                    )}
                    {a.status === 'completed' && a.result_message && (
                      <div className="text-xs mt-1 text-emerald-400">{a.result_message}</div>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}>
                    <StatusIcon className="h-3 w-3" /> {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}