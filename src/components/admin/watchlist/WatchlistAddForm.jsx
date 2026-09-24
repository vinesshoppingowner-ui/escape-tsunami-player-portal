import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Eye } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';

const LEVELS = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }];

export default function WatchlistAddForm({ onAdded, initialUsername = '' }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ roblox_username: initialUsername, reason: '', level: 'medium' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.roblox_username.trim()) return;
    setSaving(true);
    await base44.entities.WatchlistEntry.create({ ...form, roblox_username: form.roblox_username.trim(), added_by: user?.full_name || user?.email });
    setForm({ roblox_username: '', reason: '', level: 'medium' });
    setSaving(false);
    onAdded?.();
  };

  const input = 'bg-slate-950/60 border border-white/15 rounded-lg px-3 h-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50';
  return (
    <form onSubmit={submit} className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 grid grid-cols-1 sm:grid-cols-[1fr_2fr_130px_auto] gap-2">
      <input value={form.roblox_username} onChange={(e) => setForm({ ...form, roblox_username: e.target.value })} placeholder="Roblox username" className={input} />
      <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why watch this player?" className={input} />
      <CustomDropdown value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={LEVELS} />
      <button type="submit" disabled={saving || !form.roblox_username.trim()} className="h-9 px-4 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Watch
      </button>
    </form>
  );
}