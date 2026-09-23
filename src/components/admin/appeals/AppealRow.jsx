import { Checkbox } from '@/components/ui/checkbox';
import AppealQuickActions from '@/components/admin/appeals/AppealQuickActions';
import { STATUS_STYLES, priorityFor } from '@/components/admin/appeals/appealMeta';

export default function AppealRow({ appeal, moderation, checked, onToggle, onOpen, busy, onAction }) {
  const priority = priorityFor(moderation);
  const st = STATUS_STYLES[appeal.status] || STATUS_STYLES['Pending'];
  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
        checked ? 'bg-cyan-500/[0.06] border-cyan-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-cyan-500/30'
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
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">{new Date(appeal.created_date).toLocaleString()}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priority.cls}`}>{priority.label}</span>
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