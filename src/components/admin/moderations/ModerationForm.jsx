import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logStaffAction } from '@/lib/staffLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Gavel, Copy, Bot } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { pushBan } from '@/lib/renderBridge';
import { useToast } from '@/components/ui/use-toast';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const STATUSES = ['Active', 'Expired', 'Repealed'];
const DISCORD_ACTIONS = [
  { value: 'timeout', label: 'Timeout (mute)' },
  { value: 'untimeout', label: 'Remove Timeout' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban', label: 'Ban' },
  { value: 'unban', label: 'Unban' },
];
const DURATION_PRESETS = [
  { value: '', label: 'Permanent / N/A' },
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: 'custom', label: 'Custom…' },
];

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

export default function ModerationForm({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [durationMode, setDurationMode] = useState('');

  const reset = () => { setForm(empty); setDurationMode(''); };

  const handleClose = () => { reset(); onClose(); };

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
      reset();
      onClose();
      onCreated?.();
    } finally {
      setSaving(false);
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

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="bg-slate-900 border-white/15 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">New moderation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Platform selector */}
          <div>
            <Label className="text-xs text-slate-400">Platform</Label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => set('platform')('roblox')}
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
                onClick={() => set('platform')('discord')}
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
                  <Input value={form.discord_user_id} onChange={(e) => set('discord_user_id')(e.target.value)} placeholder="e.g. 123456789012345678" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Discord username (optional)</Label>
                  <Input value={form.discord_username} onChange={(e) => set('discord_username')(e.target.value)} placeholder="e.g. username" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Action type</Label>
                  <CustomDropdown
                    value={form.action_type}
                    onChange={set('action_type')}
                    options={DISCORD_ACTIONS}
                    className="mt-1"
                  />
                </div>
                {form.action_type === 'timeout' && (
                  <div>
                    <Label className="text-xs text-slate-400">Duration (minutes)</Label>
                    <Input type="number" min="1" value={form.duration_minutes} onChange={(e) => set('duration_minutes')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-400">Reason *</Label>
                <Textarea rows={2} value={form.reason} onChange={(e) => set('reason')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1" />
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
                  <Input value={form.roblox_username} onChange={(e) => set('roblox_username')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Type</Label>
                  <CustomDropdown
                    value={form.moderation_type}
                    onChange={set('moderation_type')}
                    options={TYPES.map((t) => ({ value: t, label: t }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Reason *</Label>
                  <Input value={form.reason} onChange={(e) => set('reason')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Duration</Label>
                  <CustomDropdown
                    value={durationMode}
                    onChange={(v) => {
                      setDurationMode(v);
                      if (v !== 'custom') set('duration')(v);
                    }}
                    options={DURATION_PRESETS}
                    className="mt-1"
                  />
                </div>
                {durationMode === 'custom' && (
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-400">Custom duration</Label>
                    <Input value={form.duration} onChange={(e) => set('duration')(e.target.value)} placeholder="e.g. 12h, 5d" className="bg-slate-950/60 border-white/15 text-white mt-1" />
                  </div>
                )}
                <div>
                  <Label className="text-xs text-slate-400">Staff member</Label>
                  <Input value={form.staff_member} onChange={(e) => set('staff_member')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Status</Label>
                  <CustomDropdown
                    value={form.status}
                    onChange={set('status')}
                    options={STATUSES.map((s) => ({ value: s, label: s }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400">Details</Label>
                <Textarea rows={2} value={form.details} onChange={(e) => set('details')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-400">Evidence type</Label>
                  <CustomDropdown
                    value={form.evidence_type}
                    onChange={(v) => setForm((f) => ({ ...f, evidence_type: v, evidence_text: '', evidence_image_url: '' }))}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'chat_log', label: 'Chat log' },
                      { value: 'screenshot', label: 'Screenshot' },
                    ]}
                    className="mt-1"
                  />
                </div>
                {form.evidence_type === 'chat_log' && (
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-400">Chat log</Label>
                    <Textarea rows={4} value={form.evidence_text} onChange={(e) => set('evidence_text')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white mt-1 font-mono text-xs" placeholder="Paste the in-game chat log…" />
                  </div>
                )}
                {form.evidence_type === 'screenshot' && (
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-400">Screenshot URL</Label>
                    <Input value={form.evidence_image_url} onChange={(e) => set('evidence_image_url')(e.target.value)} placeholder="https://… image URL" className="bg-slate-950/60 border-white/15 text-white mt-1" />
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
      </DialogContent>
    </Dialog>
  );
}