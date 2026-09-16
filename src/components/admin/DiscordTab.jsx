import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logStaffAction } from '@/lib/staffLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Bot, Clock, CheckCircle2, XCircle } from 'lucide-react';

const ACTIONS = [
  { value: 'timeout', label: 'Timeout (mute)', needsDuration: true },
  { value: 'untimeout', label: 'Remove Timeout', needsDuration: false },
  { value: 'kick', label: 'Kick', needsDuration: false },
  { value: 'ban', label: 'Ban', needsDuration: false },
  { value: 'unban', label: 'Unban', needsDuration: false },
];

const STATUS_STYLES = {
  pending: { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock, label: 'Pending' },
  completed: { cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: CheckCircle2, label: 'Done' },
  failed: { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle, label: 'Failed' },
};

const empty = {
  discord_user_id: '',
  discord_username: '',
  action_type: 'timeout',
  reason: '',
  duration_minutes: 5,
};

export default function DiscordTab() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setList((await base44.entities.DiscordAction.list('-created_date', 100)) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const create = async () => {
    if (!form.discord_user_id || !form.reason) return;
    setSaving(true);
    try {
      await base44.entities.DiscordAction.create({
        ...form,
        duration_minutes: form.action_type === 'timeout' ? Number(form.duration_minutes) : undefined,
        status: 'pending',
        issued_by: user?.full_name || user?.email || 'Unknown staff',
      });
      await logStaffAction(user, 'moderation_issued', form.discord_username || form.discord_user_id, `Discord ${form.action_type} — ${form.reason}`);
      setForm(empty);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4 flex items-start gap-3">
        <Bot className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-sm text-slate-300">
          <span className="font-medium text-white">Discord remote moderation.</span> Actions queued here are picked up by your Discord bot and executed in your server within ~10 seconds. The list auto-refreshes so you can see the result.
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{list.length} Discord action{list.length !== 1 ? 's' : ''}.</p>
        <Button size="sm" onClick={() => setShowForm((s) => !s)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
          <Plus className="h-4 w-4 mr-1.5" /> {showForm ? 'Cancel' : 'New Discord action'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 mb-5 space-y-3">
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
                {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
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
          <div className="flex justify-end">
            <Button onClick={create} disabled={saving || !form.discord_user_id || !form.reason} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
              {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Queuing</> : <><Bot className="h-4 w-4 mr-1.5" /> Queue Discord action</>}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-400">
          No Discord actions yet. Queue one above and your bot will execute it.
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((a) => {
            const st = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
            const StatusIcon = st.icon;
            return (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="text-cyan-300 font-medium">{a.discord_username || a.discord_user_id}</span>
                    <span className="text-slate-500"> · {a.action_type}{a.action_type === 'timeout' && a.duration_minutes ? ` (${a.duration_minutes}m)` : ''}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{a.reason}</div>
                  {a.result_message && (
                    <div className={`text-xs mt-1 ${a.status === 'failed' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {a.result_message}
                    </div>
                  )}
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}>
                  <StatusIcon className="h-3 w-3" /> {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}