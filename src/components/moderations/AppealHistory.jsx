import { motion } from 'framer-motion';
import { ScrollText, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Under Review': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Denied: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};
const STATUS_ICON = { Pending: Clock, 'Under Review': Clock, Approved: CheckCircle2, Denied: XCircle };

export default function AppealHistory({ appeals = [], moderations = [] }) {
  if (!appeals.length) return null;
  const modMap = Object.fromEntries(moderations.map((m) => [m.id, m]));

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2.5 mb-4">
        <ScrollText className="h-5 w-5 text-cyan-400" />
        <h2 className="font-display text-xl font-semibold">Appeal history</h2>
        <span className="text-xs text-slate-500">{appeals.length}</span>
      </div>

      <div className="space-y-3">
        {appeals.map((a, i) => {
          const mod = modMap[a.moderation_id];
          const StatusIcon = STATUS_ICON[a.status] || Clock;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-slate-400">
                    Appeal for <span className="text-white font-medium">{mod?.moderation_type || 'Moderation'}</span>
                    {mod?.reason ? <span className="text-slate-500"> — {mod.reason}</span> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{a.appeal_reason}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[a.status] || ''}`}>
                  <StatusIcon className="h-3.5 w-3.5" /> {a.status}
                </span>
              </div>

              {a.staff_response ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-950/50 border border-white/10 p-3">
                  <MessageSquare className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-0.5">Decision from the moderation team</div>
                    <p className="text-sm text-slate-200">{a.staff_response}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">No decision yet — your appeal is awaiting review.</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}