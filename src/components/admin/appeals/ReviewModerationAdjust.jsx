import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Loader2, SlidersHorizontal, Undo2, Save } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { logStaffAction } from '@/lib/staffLog';
import { pushUnban } from '@/lib/renderBridge';
import { rebanOp } from '@/lib/staffUndo';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const isBan = (t) => t === 'Temporary Ban' || t === 'Permanent Ban';

export default function ReviewModerationAdjust({ moderation, user, onChanged }) {
  const [type, setType] = useState(moderation.moderation_type);
  const [duration, setDuration] = useState(moderation.duration || '');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    setType(moderation.moderation_type);
    setDuration(moderation.duration || '');
  }, [moderation]);

  const changed = type !== moderation.moderation_type || duration !== (moderation.duration || '');
  const repealed = moderation.status === 'Repealed';

  const saveAdjust = async () => {
    setBusy('save');
    await base44.entities.Moderation.update(moderation.id, { moderation_type: type, duration });
    if (isBan(moderation.moderation_type) && !isBan(type)) await pushUnban(moderation.roblox_username);
    await logStaffAction(user, 'moderation_edited', moderation.roblox_username, `Adjusted ${moderation.moderation_type} → ${type}${duration ? ` (${duration})` : ''}`,
      [{ op: 'update', entity: 'Moderation', id: moderation.id, data: { moderation_type: moderation.moderation_type, duration: moderation.duration || '' } },
        ...(isBan(moderation.moderation_type) && !isBan(type) ? rebanOp(moderation) : [])]);
    setBusy(null);
    onChanged();
  };

  const repeal = async () => {
    if (!window.confirm('Repeal this moderation without deciding the appeal?')) return;
    setBusy('repeal');
    await base44.entities.Moderation.update(moderation.id, { status: 'Repealed' });
    if (isBan(moderation.moderation_type)) await pushUnban(moderation.roblox_username);
    await logStaffAction(user, 'moderation_edited', moderation.roblox_username, `Repealed ${moderation.moderation_type}`,
      [{ op: 'update', entity: 'Moderation', id: moderation.id, data: { status: moderation.status } }, ...rebanOp(moderation)]);
    setBusy(null);
    onChanged();
  };

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
        <SlidersHorizontal className="h-4 w-4 text-cyan-400" /> Adjust moderation
        {repealed && <span className="ml-auto text-[10px] uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Repealed</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <CustomDropdown value={type} onChange={setType} options={TYPES.map((t) => ({ value: t, label: t }))} />
        <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration e.g. 24h, 7d, Permanent" className="h-9 bg-slate-950/60 border-white/15 text-white" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button disabled={!changed || !!busy} onClick={saveAdjust} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15 text-xs font-medium disabled:opacity-40">
          {busy === 'save' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save changes
        </button>
        <button disabled={repealed || !!busy} onClick={repeal} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/15 text-xs font-medium disabled:opacity-40">
          {busy === 'repeal' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />} Repeal moderation
        </button>
      </div>
    </div>
  );
}