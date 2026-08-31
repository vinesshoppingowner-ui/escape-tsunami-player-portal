import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Gavel, Copy } from 'lucide-react';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const STATUSES = ['Active', 'Expired', 'Repealed'];
const empty = {
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
};

export default function ModerationsTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setList((await base44.entities.Moderation.list('-moderation_date', 100)) || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.roblox_username || !form.reason) return;
    setSaving(true);
    try {
      await base44.entities.Moderation.create({ ...form, moderation_date: new Date().toISOString() });
      await base44.entities.Notification.create({
        roblox_username: form.roblox_username,
        title: `New ${form.moderation_type} issued`,
        body: form.reason || 'A moderation action has been added to your account.',
        type: 'moderation_issued',
        read: false,
      });
      setForm(empty);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.Moderation.delete(id);
    await load();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{list.length} moderation{list.length !== 1 ? 's' : ''} on record.</p>
        <Button
          size="sm"
          onClick={() => setShowForm((s) => !s)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-1.5" /> {showForm ? 'Cancel' : 'New moderation'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 mb-5 space-y-3">
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
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-400">No moderations issued yet.</div>
      ) : (
        <div className="space-y-2">
          {list.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="text-cyan-300 font-medium">{m.roblox_username}</span>
                  <span className="text-slate-500"> · {m.moderation_type}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{m.reason}{m.duration ? ` · ${m.duration}` : ''} · {m.status}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(m.id)} className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}