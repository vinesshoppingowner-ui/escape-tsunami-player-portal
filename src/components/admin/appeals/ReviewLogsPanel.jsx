import { Loader2 } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';

const EXPLOIT_STYLES = {
  Teleport: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  Fly: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  Noclip: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
};

const Empty = ({ children }) => <div className="text-sm text-slate-500 py-3">{children}</div>;
const Loading = () => <div className="flex items-center gap-2 text-sm text-slate-400 py-3"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

export default function ReviewLogsPanel({ chatLogs, exploitLogs, loading, error }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Chat logs ({chatLogs.length})</SectionLabel>
        {loading ? <Loading /> : error ? <div className="text-sm text-rose-400 py-3">{error}</div> : chatLogs.length === 0 ? <Empty>No chat logs on file for this player.</Empty> : (
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/70">
            {chatLogs.slice(-50).reverse().map((log, i) => (
              <div key={i} className="py-2 text-sm">
                <span className="text-slate-500 text-xs mr-2 font-mono">{log.time || new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-slate-200">{log.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <SectionLabel>Exploit logs ({exploitLogs.length})</SectionLabel>
        {loading ? <Loading /> : exploitLogs.length === 0 ? <Empty>No exploit detections on file for this player.</Empty> : (
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/70">
            {exploitLogs.slice(-30).reverse().map((log, i) => (
              <div key={i} className="py-2 text-sm flex items-start gap-2">
                <span className={`shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${EXPLOIT_STYLES[log.exploitType] || 'bg-white/5 text-slate-300 border-white/10'}`}>{log.exploitType}</span>
                <div className="min-w-0">
                  <div className="text-slate-200 text-xs">{log.details}</div>
                  <div className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}