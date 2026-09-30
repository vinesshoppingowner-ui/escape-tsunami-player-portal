import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { emailModerationChanged } from '@/lib/moderationEmails';
import { logStaffAction } from '@/lib/staffLog';
import { pushUnban } from '@/lib/renderBridge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { snapshot, rebanOp } from '@/lib/staffUndo';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const STATUSES = ['Active', 'Expired', 'Repealed'];
const opts = (arr) => arr.map((v) => ({ value: v, label: v }));
const EVIDENCE = [{ value: 'none', label: 'None' }, { value: 'chat_log', label: 'Chat log' }, { value: 'screenshot', label: 'Screenshot' }];

export default function ModerationEditDialog({ moderation, user, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(moderation ? { ...moderation } : null); }, [moderation]);
  if (!form) return null;
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const field = 'bg-slate-950/60 border-white/10 text-white mt-1';

  const save = async () => {
    setSaving(true);
    const { roblox_username, moderation_type, reason, details, duration, status, staff_member, evidence_type, evidence_text, evidence_image_url } = form;
    await base44.entities.Moderation.update(moderation.id, { moderation_type, reason, details, duration, status, staff_member, evidence_type, evidence_text, evidence_image_url });
    emailModerationChanged(moderation, { moderation_type, reason, duration, status });
    if (moderation.moderation_type.includes('Ban') && moderation.status === 'Active' && status !== 'Active') {
      try { await pushUnban(roblox_username); } catch { /* game server offline */ }
    }
    const liftedBan = moderation.moderation_type.includes('Ban') && moderation.status === 'Active' && status !== 'Active';
    await logStaffAction(user, 'moderation_edited', roblox_username, `Edited ${moderation_type} — ${reason}`,
      [{ op: 'update', entity: 'Moderation', id: moderation.id, data: snapshot(moderation) }, ...(liftedBan ? rebanOp(moderation) : [])]);
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4 text-cyan-300" /> Edit moderation — {form.roblox_username}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-xs text-slate-400">Type</Label><CustomDropdown value={form.moderation_type} onChange={set('moderation_type')} options={opts(TYPES)} className="mt-1" /></div>
            <div><Label className="text-xs text-slate-400">Status</Label><CustomDropdown value={form.status} onChange={set('status')} options={opts(STATUSES)} className="mt-1" /></div>
            <div><Label className="text-xs text-slate-400">Duration</Label><Input value={form.duration || ''} onChange={(e) => set('duration')(e.target.value)} placeholder="e.g. 7d" className={field} /></div>
            <div><Label className="text-xs text-slate-400">Staff member</Label><Input value={form.staff_member || ''} onChange={(e) => set('staff_member')(e.target.value)} className={field} /></div>
          </div>
          <div><Label className="text-xs text-slate-400">Reason</Label><Input value={form.reason || ''} onChange={(e) => set('reason')(e.target.value)} className={field} /></div>
          <div><Label className="text-xs text-slate-400">Details</Label><Textarea rows={2} value={form.details || ''} onChange={(e) => set('details')(e.target.value)} className={field} /></div>
          <div><Label className="text-xs text-slate-400">Evidence</Label><CustomDropdown value={form.evidence_type || 'none'} onChange={set('evidence_type')} options={EVIDENCE} className="mt-1" /></div>
          {form.evidence_type === 'chat_log' && <Textarea rows={3} value={form.evidence_text || ''} onChange={(e) => set('evidence_text')(e.target.value)} className={`${field} font-mono text-xs`} />}
          {form.evidence_type === 'screenshot' && <Input value={form.evidence_image_url || ''} onChange={(e) => set('evidence_image_url')(e.target.value)} placeholder="https://… image URL" className={field} />}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={save} disabled={saving || !form.reason} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving</> : 'Save changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}