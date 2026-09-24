import { Checkbox } from '@/components/ui/checkbox';
import { Lock, AlarmClock, Quote, Gavel, UserCheck, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSla } from '@/lib/appealSla';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import AppealQuickActions from '@/components/admin/appeals/AppealQuickActions';
import { STATUS_STYLES, priorityFor } from '@/components/admin/appeals/appealMeta';

const STRIPE = { High: 'bg-rose-500', Medium: 'bg-amber-400', Low: 'bg-emerald-400' };

export default function AppealRow({ appeal, moderation, checked, onToggle, onOpen, busy, onAction, playerLocked }) {
  const priority = priorityFor(moderation);
  const st = STATUS_STYLES[appeal.status] || STATUS_STYLES['Pending'];
  const sla = getSla(appeal);
  const overdue = sla?.level === 'overdue';

  return (
    <div
      onClick={onOpen}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 ${
        checked ? 'border-cyan-400/50 bg-cyan-500/[0.07]' : 'border-white/10 bg-slate-900/60 hover:border-white/20'
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${STRIPE[priority.label]}`} />

      <div className="flex items-center gap-3 pl-5 pr-4 pt-4">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={checked} onCheckedChange={onToggle} className="border-white/30" />
        </div>
        <RobloxAvatar username={appeal.roblox_username} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">{appeal.roblox_username}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${st}`}>{appeal.status}</span>
            {playerLocked && <Lock className="h-3.5 w-3.5 text-violet-300" title="Appeals locked" />}
          </div>
          <div className="text-xs text-slate-500">
            Submitted {formatDistanceToNow(new Date(appeal.created_date), { addSuffix: true })}
          </div>
        </div>
        {sla && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${overdue ? 'bg-rose-500 text-white animate-pulse-slow' : 'bg-amber-400/90 text-slate-950'}`}>
            <AlarmClock className="h-3.5 w-3.5" /> {Math.floor(sla.hours)}h {overdue ? 'overdue' : 'waiting'}
          </span>
        )}
      </div>

      <div className="grid gap-3 pl-5 pr-4 py-3 md:grid-cols-[1fr_220px]">
        <div className="relative rounded-lg bg-white/[0.03] px-4 py-3">
          <Quote className="absolute right-3 top-2.5 h-4 w-4 text-white/10" />
          <p className="text-sm text-slate-200 line-clamp-2 italic">"{appeal.appeal_reason}"</p>
        </div>
        <div className="rounded-lg border border-dashed border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
            <Gavel className="h-3 w-3" /> Appealing
          </div>
          <div className="text-sm font-medium text-white mt-0.5">{moderation?.moderation_type || 'Moderation'}</div>
          {moderation?.reason && <div className="text-xs text-slate-400 truncate">{moderation.reason}</div>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-black/20 pl-5 pr-4 py-2">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><Flag className="h-3.5 w-3.5" /> {priority.label} priority</span>
          <span className="inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> {appeal.assigned_to || 'Unassigned'}</span>
        </div>
        <AppealQuickActions current={appeal.status} busy={busy} onAction={onAction} />
      </div>
    </div>
  );
}