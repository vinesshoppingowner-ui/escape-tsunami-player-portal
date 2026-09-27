import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Trash2, Undo2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import RoleEditor from '@/components/admin/discord/RoleEditor';
import ImageRoleImport from '@/components/admin/discord/ImageRoleImport';
import TextRoleImport from '@/components/admin/discord/TextRoleImport';
import { PERMISSIONS } from '@/components/admin/discord/discordPerms';

const KEYS = ['name', 'color', 'hoist', 'mentionable', 'permissions'];

export default function DiscordRolesPanel() {
  const { toast } = useToast();
  const [original, setOriginal] = useState(null);
  const [edits, setEdits] = useState({});
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState([]);
  const [saving, setSaving] = useState(false);

  // keep = edits to preserve after reloading (e.g. ones that failed to save)
  const load = (keep = {}) => base44.functions.invoke('discordSend', { action: 'roles' })
    .then((r) => { setOriginal(r.data.roles); setEdits(keep); setHistory([]); setSelected((s) => (r.data.roles.some((x) => x.id === s) ? s : r.data.roles[0]?.id)); })
    .catch((err) => { setOriginal([]); toast({ title: err.response?.data?.error || 'Could not load roles', variant: 'destructive' }); });
  useEffect(() => { load(); }, []);

  if (!original) return <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading roles…</div>;

  const current = (r) => edits[r.id] || r;
  const changed = original.filter((r) => edits[r.id] && KEYS.some((k) => String(edits[r.id][k]) !== String(r[k])));
  const role = original.find((r) => r.id === selected);

  const updateEdits = (next) => { setHistory((h) => [...h.slice(-99), edits]); setEdits(next); };
  const undo = () => { setEdits(history[history.length - 1]); setHistory((h) => h.slice(0, -1)); };

  const saveAll = async () => {
    setSaving(true);
    const updates = changed.map((r) => ({ id: r.id, ...Object.fromEntries(KEYS.map((k) => [k, edits[r.id][k]])) }));
    const res = await base44.functions.invoke('discordSend', { action: 'updateRoles', updates });
    const failed = res.data.results.filter((x) => !x.ok);
    toast({ title: `Saved ${updates.length - failed.length} of ${updates.length} roles`, description: failed[0]?.error, variant: failed.length ? 'destructive' : undefined });
    await load(Object.fromEntries(failed.map((f) => [f.id, edits[f.id]])));
    setSaving(false);
  };

  const removeRoles = async (ids) => {
    const names = original.filter((r) => ids.includes(r.id)).map((r) => r.name).join(', ');
    if (!window.confirm(`Delete ${ids.length} role(s) from Discord: ${names}? This can't be undone.`)) return;
    setSaving(true);
    const results = await Promise.allSettled(ids.map((id) => base44.functions.invoke('discordSend', { action: 'deleteRole', channel_id: id })));
    const failed = results.filter((r) => r.status === 'rejected');
    toast({ title: `Removed ${ids.length - failed.length} of ${ids.length} roles`, description: failed[0]?.reason?.response?.data?.error, variant: failed.length ? 'destructive' : undefined });
    setChecked([]);
    const { ...keep } = edits;
    ids.forEach((id) => delete keep[id]);
    await load(keep);
    setSaving(false);
  };

  const applyImport = (changes) => {
    const next = { ...edits };
    let count = 0;
    changes.forEach((c) => {
      const r = original.find((x) => x.name.toLowerCase() === (c.old_name || '').toLowerCase());
      if (!r) return;
      const e = { ...current(r) };
      if (c.new_name) e.name = c.new_name;
      if (/^#?[0-9a-f]{6}$/i.test(c.color_hex || '')) e.color = parseInt(c.color_hex.replace('#', ''), 16);
      if (c.permissions?.length) {
        const bits = PERMISSIONS.filter(([, l]) => c.permissions.some((p) => p.toLowerCase() === l.toLowerCase())).map(([b]) => b);
        e.permissions = bits.reduce((acc, b) => acc | (1n << BigInt(b)), 0n).toString();
      }
      next[r.id] = e;
      count++;
    });
    updateEdits(next);
    return count;
  };

  const toggleCheck = (id) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-5">
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-2 max-h-[600px] overflow-y-auto">
        <ImageRoleImport roleNames={original.map((r) => r.name)} onApply={applyImport} />
        <TextRoleImport roleNames={original.map((r) => r.name)} onApply={applyImport} />
        {checked.length > 0 && (
          <Button size="sm" disabled={saving} onClick={() => removeRoles(checked)} className="w-full mb-2 bg-rose-600 hover:bg-rose-500 text-white"><Trash2 className="h-4 w-4" /> Remove {checked.length} selected</Button>
        )}
        {original.map((r) => (
          <div key={r.id} className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm ${selected === r.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
            <Checkbox checked={checked.includes(r.id)} onCheckedChange={() => toggleCheck(r.id)} />
            <button onClick={() => setSelected(r.id)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: current(r).color ? `#${current(r).color.toString(16).padStart(6, '0')}` : '#99AAB5' }} />
              <span className="truncate">{current(r).name}</span>
              {changed.includes(r) && <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" />}
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
        {role && <RoleEditor role={current(role)} onChange={(v) => updateEdits({ ...edits, [role.id]: v })} />}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <Button variant="outline" disabled={!role || saving} onClick={() => removeRoles([role.id])} className="mr-auto border-rose-500/40 bg-transparent text-rose-300 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /> Remove role</Button>
          <Button variant="outline" disabled={!history.length || saving} onClick={undo} className="border-slate-700 bg-transparent text-slate-300"><Undo2 className="h-4 w-4" /> Undo</Button>
          <Button variant="outline" disabled={!changed.length || saving} onClick={() => updateEdits({})} className="border-slate-700 bg-transparent text-slate-300">Discard</Button>
          <Button onClick={saveAll} disabled={!changed.length || saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all ({changed.length})
          </Button>
        </div>
      </div>
    </div>
  );
}