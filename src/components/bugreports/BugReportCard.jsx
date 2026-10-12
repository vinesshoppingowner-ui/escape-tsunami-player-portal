import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS_STYLES = {
  'Submitted': { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock, label: 'Submitted' },
  'Confirmed': { cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', icon: CheckCircle2, label: 'Confirmed' },
  'Declined': { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle, label: 'Declined' },
};

const SEV_DOT = {
  'Low': 'bg-slate-400',
  'Medium': 'bg-amber-400',
  'High': 'bg-orange-400',
  'Critical': 'bg-rose-400',
};

export default function BugReportCard({ report, severityBadge, expanded, onToggle }) {
  const sev = severityBadge(report.severity);
  const status = STATUS_STYLES[report.status] || STATUS_STYLES['Submitted'];
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-white/[0.03] border overflow-hidden transition-colors ${expanded ? 'border-cyan-500/30' : 'border-white/10 hover:border-white/20'}`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <span className={`shrink-0 w-2 h-2 rounded-full ${SEV_DOT[report.severity] || 'bg-slate-400'}`} />
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sev.cls}`}>
          {report.severity}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-white truncate">{report.title}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">
            {new Date(report.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {report.roblox_username}
          </span>
        </span>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.cls}`}>
          <StatusIcon className="h-3 w-3" /> {status.label}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4"
        >
          <div className="pt-3 border-t border-white/5">
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{report.description}</p>
            {report.status === 'Confirmed' && (
              <p className="mt-3 text-xs text-cyan-300/80 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Our team has confirmed this bug and is working on a fix.
              </p>
            )}
            {report.status === 'Declined' && (
              <p className="mt-3 text-xs text-rose-300/80 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" /> This report was reviewed and not considered a bug.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}