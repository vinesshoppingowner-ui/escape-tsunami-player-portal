import { useEffect, useState } from 'react';
import { MessageSquare, Zap, Loader2 } from 'lucide-react';
import { fetchChatLogs, fetchExploitLogs } from '@/lib/renderBridge';

export default function PlayerLogsPanel({ username }) {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchChatLogs(username).catch(() => []),
      fetchExploitLogs(username).catch(() => []),
    ]).then(([chat, exploits]) => setLogs({ chat, exploits }));
  }, [username]);

  if (!logs) return <div className="flex items-center gap-2 text-sm text-slate-400 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading logs…</div>;

  const box = 'rounded-xl bg-slate-900/60 border border-white/10 max-h-64 overflow-y-auto divide-y divide-white/5';
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-slate-400" /> Chat logs ({logs.chat.length})</h3>
        {logs.chat.length === 0 ? <p className="text-sm text-slate-500">No chat logs.</p> : (
          <div className={box}>
            {logs.chat.slice(-50).reverse().map((l, i) => (
              <div key={i} className="px-3 py-2 text-sm"><span className="text-slate-500 text-xs mr-2">{l.time || new Date(l.timestamp).toLocaleString()}</span><span className="text-slate-200">{l.msg}</span></div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Exploit logs ({logs.exploits.length})</h3>
        {logs.exploits.length === 0 ? <p className="text-sm text-slate-500">No exploit detections.</p> : (
          <div className={box}>
            {logs.exploits.slice(-30).reverse().map((l, i) => (
              <div key={i} className="px-3 py-2 text-sm">
                <span className="text-amber-300 text-xs font-semibold mr-2">{l.exploitType}</span>
                <span className="text-slate-300 text-xs">{l.details}</span>
                <div className="text-[10px] text-slate-500">{new Date(l.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}