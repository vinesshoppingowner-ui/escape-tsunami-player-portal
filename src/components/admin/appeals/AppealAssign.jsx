import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logStaffAction } from '@/lib/staffLog';
import { UserCheck, Loader2 } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';

export default function AppealAssign({ appeal, user, onChanged }) {
  const [staff, setStaff] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    base44.entities.User.list().then((users) =>
      setStaff((users || []).filter((u) => u.role === 'admin' || u.role === 'staff' || u.is_owner))
    );
  }, []);

  const assign = async (email) => {
    setBusy(true);
    const target = staff.find((s) => s.email === email);
    await base44.entities.Appeal.update(appeal.id, target
      ? { assigned_to: target.full_name || target.email, assigned_to_email: target.email, assigned_at: new Date().toISOString() }
      : { assigned_to: '', assigned_to_email: '', assigned_at: null });
    await logStaffAction(user, 'appeal_assigned', appeal.roblox_username, target ? `Assigned appeal to ${target.full_name || target.email}` : 'Unassigned appeal');
    setBusy(false);
    onChanged?.();
  };

  const options = [{ value: '', label: 'Unassigned' }, ...staff.map((s) => ({ value: s.email, label: s.full_name || s.email }))];

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex flex-wrap items-center gap-3">
      <UserCheck className="h-4 w-4 text-cyan-400" />
      <div className="min-w-0">
        <div className="text-xs text-slate-500">Assigned to</div>
        <div className="text-sm text-white font-medium">{appeal.assigned_to || 'Nobody yet'}</div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        {appeal.assigned_to_email !== user?.email && (
          <button onClick={() => assign(user.email)} disabled={busy} className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/25">
            Claim
          </button>
        )}
        <div className="w-44">
          <CustomDropdown value={appeal.assigned_to_email || ''} onChange={assign} options={options} placeholder="Assign staff…" buttonClassName="h-8 text-xs" />
        </div>
      </div>
    </div>
  );
}