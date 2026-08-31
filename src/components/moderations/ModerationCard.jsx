import { ShieldAlert, Clock, UserCog, CheckCircle2, XCircle, Hourglass, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const typeStyles = {
  Warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Mute: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Kick: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Temporary Ban': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'Permanent Ban': 'bg-red-600/20 text-red-300 border-red-600/40',
};

const statusStyles = {
  Active: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Expired: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Repealed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const appealBadge = {
  Pending: { label: 'Appeal Pending', icon: Hourglass, cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  'Under Review': { label: 'Under Review', icon: Eye, cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  Approved: { label: 'Appeal Approved', icon: CheckCircle2, cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  Denied: { label: 'Appeal Denied', icon: XCircle, cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export default function ModerationCard({ moderation, appeal, onAppeal }) {
  const date = moderation.moderation_date
    ? new Date(moderation.moderation_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const a = appeal ? appealBadge[appeal.status] : null;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{moderation.moderation_type}</span>
              <Badge variant="outline" className={`text-xs border ${typeStyles[moderation.moderation_type] || ''}`}>
                {moderation.moderation_type}
              </Badge>
            </div>
            <div className="text-sm text-slate-400 mt-0.5">{moderation.reason}</div>
          </div>
        </div>
        <Badge variant="outline" className={`text-xs border ${statusStyles[moderation.status] || ''}`}>
          {moderation.status}
        </Badge>
      </div>

      {moderation.details && (
        <p className="mt-4 text-sm text-slate-300 leading-relaxed bg-slate-900/40 rounded-lg p-3 border border-white/5">
          {moderation.details}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {date}</span>
        {moderation.duration && <span className="flex items-center gap-1.5"><Hourglass className="h-3.5 w-3.5" /> {moderation.duration}</span>}
        {moderation.staff_member && <span className="flex items-center gap-1.5"><UserCog className="h-3.5 w-3.5" /> by {moderation.staff_member}</span>}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
        {a ? (
          <Badge variant="outline" className={`text-xs border ${a.cls}`}>
            <a.icon className="h-3 w-3 mr-1" /> {a.label}
          </Badge>
        ) : (
          <span className="text-xs text-slate-500">No appeal submitted yet</span>
        )}
        {appeal ? (
          appeal.staff_response ? (
            <span className="text-xs text-slate-400 italic line-clamp-1">“{appeal.staff_response}”</span>
          ) : (
            <span className="text-xs text-slate-500">Awaiting staff response</span>
          )
        ) : (
          <Button size="sm" onClick={onAppeal} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
            Appeal this
          </Button>
        )}
      </div>
    </div>
  );
}