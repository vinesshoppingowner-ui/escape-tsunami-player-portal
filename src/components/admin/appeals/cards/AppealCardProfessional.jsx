import { Checkbox } from '@/components/ui/checkbox';
import { Lock } from 'lucide-react';
import { format } from 'date-fns';
import { getSla } from '@/lib/appealSla';
import AppealQuickActions from '@/components/admin/appeals/AppealQuickActions';
import { priorityFor } from '@/components/admin/appeals/appealMeta';

const DOT = { Pending: 'bg-amber-400', 'Under Review': 'bg-violet-400', Approved: 'bg-emerald-400', Denied: 'bg-rose-400' };
const PRIO = { High: 'text-rose-300', Medium: 'text-amber-300', Low: 'text-emerald-300' };

export default function AppealCardProfessional({ appeal, moderation, checked, onToggle, onOpen, busy, onAction, playerLocked }) {
  const priority = priorityFor(moderation);
  const sla = getSla(appeal);
  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer grid grid-cols-[auto_minmax(0,1.1fr)_minmax(0,2fr)_auto] md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,2fr)_90px_110px_auto] items-center gap-4 rounded-md border-l-2 px-4 py-2.5 text-sm transition-colors ${
        checked ? 'border-cyan-400 bg-cyan-500/[0.07]' : 'border-transparent bg-white/[0.02] hover:bg-white/[0.05]'
      }`}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onCheckedChange={onToggle} className="border-white/30" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-slate-100 truncate">
          {appeal.roblox_username}{playerLocked && <Lock className="h-3 w-3 text-violet-300" />}
        </div>
        <div className="font-mono text-[11px] text-slate-500">{format(new Date(appeal.created_date), 'MMM d, HH:mm')}</div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-slate-300">{appeal.appeal_reason}</div>
        <div className="truncate text-[11px] text-slate-500">{moderation?.moderation_type || 'Moderation'}{moderation?.reason ? ` — ${moderation.reason}` : ''}</div>
      </div>
      <div className="hidden md:block text-xs">
        <div className={`font-semibold uppercase tracking-wide ${PRIO[priority.label]}`}>{priority.label}</div>
        {sla && <div className={`font-mono ${sla.level === 'overdue' ? 'text-rose-400' : 'text-amber-400'}`}>{Math.floor(sla.hours)}h</div>}
      </div>
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
        <span className={`h-2 w-2 rounded-full ${DOT[appeal.status] || DOT.Pending}`} /> {appeal.status}
      </div>
      <AppealQuickActions current={appeal.status} busy={busy} onAction={onAction} />
    </div>
  );
}