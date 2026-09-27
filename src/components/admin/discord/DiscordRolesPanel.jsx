import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import RoleEditor from '@/components/admin/discord/RoleEditor';

const KEYS = ['name', 'color', 'hoist', 'mentionable', 'permissions'];

export default function DiscordRolesPanel() {
  const { toast } = useToast();
  const [original, setOriginal] = useState(null);
  const [edits, setEdits] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => base44.functions.invoke('discordSend', { action: 'roles' })
    .then((r) => { setOriginal(r.data.roles); setEdits({}); setSelected((s) => s || r.data.roles[0]?.id); })
    .catch((err) => { setOriginal([]); toast({ title: err.response?.data?.error || 'Could not load roles', variant: 'destructive' }); });
  useEffect(() => { load(); }, []);

  if (!original) return <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading roles…</div>;

  const current = (r) => edits[r.id] || r;
  const changed = original.filter((r) => edits[r.id] && KEYS.some((k) => String(edits[r.id][k]) !== String(r[k])));
  const role = original.find((r) => r.id === selected);

  const saveAll = async () => {
    setSaving(true);
    const updates = changed.map((r) => ({ id: r.id, ...Object.fromEntries(KEYS.map((k) => [k, edits[r.id][k]])) }));
    const res = await base44.functions.invoke('discordSend', { action: 'updateRoles', updates });
    const failed = res.data.results.filter((x) => !x.ok);
    toast({ title: `Saved ${updates.length - failed.length} of ${updates.length} roles`, description: failed[0]?.error, variant: failed.length ? 'destructive' : undefined });
    await load();
    setSaving(false);
  };

  const removeRole = async () => {
    if (!window.confirm(`Delete the role "${role.name}" from Discord? This can't be undone.`)) return;
    setSaving(true);
    try {
      await base44.functions.invoke('discordSend', { action: 'deleteRole', channel_id: role.id });
      toast({ title: `Removed ${role.name}` });
      setSelected(null);
      await load();
    } catch (err) {
      toast({ title: err.response?.data?.error || 'Delete failed', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-5">
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-2 max-h-[600px] overflow-y-auto">
        {original.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left ${selected === r.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
            <span className="h-3 w-3 rounded-full shrink-0" style={{ background: current(r).color ? `#${current(r).color.toString(16).padStart(6, '0')}` : '#99AAB5' }} />
            <span className="truncate">{current(r).name}</span>
            {changed.includes(r) && <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" />}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
        {role && <RoleEditor role={current(role)} onChange={(v) => setEdits({ ...edits, [role.id]: v })} />}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <Button variant="outline" disabled={!role || saving} onClick={removeRole} className="mr-auto border-rose-500/40 bg-transparent text-rose-300 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /> Remove role</Button>
          <Button variant="outline" disabled={!changed.length || saving} onClick={() => setEdits({})} className="border-slate-700 bg-transparent text-slate-300">Discard</Button>
          <Button onClick={saveAll} disabled={!changed.length || saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all ({changed.length})
          </Button>
        </div>
      </div>
    </div>
  );
}