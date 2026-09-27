import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PERMISSIONS, hasPerm, togglePerm } from '@/components/admin/discord/discordPerms';

const field = 'bg-slate-950/60 border-white/15 text-white';
const hex = (n) => `#${(n || 0).toString(16).padStart(6, '0')}`;

export default function RoleEditor({ role, onChange }) {
  const set = (k, v) => onChange({ ...role, [k]: v });
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="color" value={hex(role.color)} onChange={(e) => set('color', parseInt(e.target.value.slice(1), 16))} className="h-9 w-12 rounded bg-transparent" />
        <Input value={role.name} onChange={(e) => set('name', e.target.value)} className={field} />
      </div>
      <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-300">
        <label className="flex items-center gap-2"><Switch checked={role.hoist} onCheckedChange={(v) => set('hoist', v)} /> Display separately</label>
        <label className="flex items-center gap-2"><Switch checked={role.mentionable} onCheckedChange={(v) => set('mentionable', v)} /> Mentionable</label>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Permissions</div>
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 max-h-[420px] overflow-y-auto pr-1">
          {PERMISSIONS.map(([bit, label]) => (
            <label key={bit} className="flex items-center justify-between gap-2 text-sm text-slate-300 py-1 border-b border-white/5">
              {label}
              <Switch checked={hasPerm(role.permissions, bit)} onCheckedChange={() => set('permissions', togglePerm(role.permissions, bit))} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}