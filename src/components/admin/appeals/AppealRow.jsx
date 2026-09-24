import { Checkbox } from '@/components/ui/checkbox';
import { Lock, AlarmClock } from 'lucide-react';
import { getSla } from '@/lib/appealSla';
import AppealQuickActions from '@/components/admin/appeals/AppealQuickActions';
import { STATUS_STYLES, priorityFor } from '@/components/admin/appeals/appealMeta';

export default function AppealRow({ appeal, moderation, checked, onToggle, onOpen, busy, onAction, playerLocked }) {
  const priority = priorityFor(moderation);
  const st = STATUS_STYLES[appeal.status] || STATUS_STYLES['Pending'];
  const sla = getSla(appeal);
  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
        checked ? 'bg-cyan-500/[0.06] border-cyan-500/30'
          : sla?.level === 'overdue' ? 'bg-rose-500/[0.04] border-rose-500/25 hover:bg-rose-500/[0.07]'
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-cyan-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div onClick={(e) => e.stopPropagation()} className="pt-1">
          <Checkbox checked={checked} onCheckedChange={onToggle} className="border-white/30" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-cyan-300 font-medium">{appeal.roblox_username}</span>
            <span className="text-slate-500 text-sm">· {moderation?.moderation_type || 'Moderation'}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${st}`}>{appeal.status}</span>
            {playerLocked && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
                <Lock className="h-3 w-3" /> Appeals locked
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">{new Date(appeal.created_date).toLocaleString()}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priority.cls}`}>{priority.label}</span>
            {sla && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${sla.level === 'overdue' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}`}>
                <AlarmClock className="h-3 w-3" /> {sla.level === 'overdue' ? 'Overdue' : 'Waiting'} {Math.floor(sla.hours)}h
              </span>
            )}
            {appeal.assigned_to && <span className="text-[10px] text-slate-400">· {appeal.assigned_to}</span>}
          </div>
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">{appeal.appeal_reason}</p>
          {moderation?.reason && <p className="mt-1 text-xs text-slate-500 truncate">Moderation reason: {moderation.reason}</p>}
        </div>
        <div className="shrink-0">
          <AppealQuickActions current={appeal.status} busy={busy} onAction={onAction} />
        </div>
      </div>
    </div>
  );
}