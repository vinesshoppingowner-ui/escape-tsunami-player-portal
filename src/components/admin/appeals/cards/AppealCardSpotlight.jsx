import { Checkbox } from '@/components/ui/checkbox';
import { Lock, AlarmClock, Gavel, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSla } from '@/lib/appealSla';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import AppealQuickActions from '@/components/admin/appeals/AppealQuickActions';
import { STATUS_STYLES, priorityFor } from '@/components/admin/appeals/appealMeta';

const GLOW = {
  High: 'from-rose-500/25 via-rose-500/5 border-rose-500/30',
  Medium: 'from-amber-500/20 via-amber-500/5 border-amber-500/25',
  Low: 'from-emerald-500/20 via-emerald-500/5 border-emerald-500/25',
};

export default function AppealCardSpotlight({ appeal, moderation, checked, onToggle, onOpen, busy, onAction, playerLocked }) {
  const priority = priorityFor(moderation);
  const st = STATUS_STYLES[appeal.status] || STATUS_STYLES['Pending'];
  const sla = getSla(appeal);
  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer rounded-3xl border bg-gradient-to-br to-transparent p-5 transition-all hover:scale-[1.01] ${GLOW[priority.label]} ${checked ? 'ring-2 ring-cyan-400/60' : ''}`}
    >
      <div className="flex items-start gap-4">
        <RobloxAvatar username={appeal.roblox_username} size={60} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-white truncate">{appeal.roblox_username}</span>
            {playerLocked && <Lock className="h-4 w-4 text-violet-300" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2.5 py-0.5 rounded-full border ${st}`}>{appeal.status}</span>
            <span className="inline-flex items-center gap-1 text-slate-300"><Gavel className="h-3.5 w-3.5" /> {moderation?.moderation_type || 'Moderation'}</span>
            <span className="text-slate-500">{formatDistanceToNow(new Date(appeal.created_date), { addSuffix: true })}</span>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={checked} onCheckedChange={onToggle} className="h-5 w-5 border-white/30" />
        </div>
      </div>

      <p className="mt-4 text-lg leading-snug text-white line-clamp-3">{appeal.appeal_reason}</p>
      {moderation?.reason && <p className="mt-1.5 text-sm text-slate-400">Banned for: {moderation.reason}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 font-bold uppercase tracking-wide ${priority.cls} border`}>{priority.label}</span>
          {sla && (
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${sla.level === 'overdue' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-950'}`}>
              <AlarmClock className="h-3.5 w-3.5" /> {Math.floor(sla.hours)}h
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-slate-400"><UserCheck className="h-3.5 w-3.5" /> {appeal.assigned_to || 'Unassigned'}</span>
        </div>
        <AppealQuickActions current={appeal.status} busy={busy} onAction={onAction} />
      </div>
    </div>
  );
}