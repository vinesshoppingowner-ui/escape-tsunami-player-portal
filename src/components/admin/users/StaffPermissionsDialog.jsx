import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2 } from 'lucide-react';
import { STAFF_PERMISSIONS, deniedPermissions } from '@/lib/staffPermissions';
import { logStaffAction } from '@/lib/staffLog';

export default function StaffPermissionsDialog({ target, user, onClose, onSaved }) {
  const [denied, setDenied] = useState(deniedPermissions(target));
  const [saving, setSaving] = useState(false);
  const name = target.full_name || target.email.split('@')[0];

  const toggle = (key, allowed) => setDenied((d) => (allowed ? d.filter((k) => k !== key) : [...d, key]));

  const save = async () => {
    setSaving(true);
    await base44.entities.User.update(target.id, { denied_permissions: denied });
    const off = STAFF_PERMISSIONS.filter((p) => denied.includes(p.key)).map((p) => p.label);
    await logStaffAction(user, 'permissions_changed', name, off.length ? `Restricted ${name}: ${off.join(', ')}` : `Gave ${name} full staff permissions`);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-amber-300" /> Permissions — {name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {STAFF_PERMISSIONS.map((p) => (
            <label key={p.key} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] cursor-pointer">
              <span className="text-sm text-slate-200">{p.label}</span>
              <Switch checked={!denied.includes(p.key)} onCheckedChange={(on) => toggle(p.key, on)} />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save permissions'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}