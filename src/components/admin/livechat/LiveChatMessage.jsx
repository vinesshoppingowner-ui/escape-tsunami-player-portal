import { format } from 'date-fns';

const COLORS = [
  'text-cyan-300', 'text-emerald-300', 'text-amber-300', 'text-violet-300',
  'text-rose-300', 'text-sky-300', 'text-lime-300', 'text-fuchsia-300',
];

const RING = [
  'from-cyan-500 to-blue-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600', 'from-rose-500 to-pink-600', 'from-sky-500 to-indigo-600',
  'from-lime-500 to-green-600', 'from-fuchsia-500 to-purple-600',
];

function hash(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973;
  return h;
}

export default function LiveChatMessage({ msg, grouped }) {
  const time = msg.timestamp || msg.created_date;
  const idx = hash(msg.roblox_username) % COLORS.length;
  const initial = (msg.roblox_username || '?').charAt(0).toUpperCase();
  const server = msg.server_name || '';
  const shortServer = server.length > 8 ? `${server.slice(0, 4)}…${server.slice(-4)}` : server;

  return (
    <div className={`group flex items-start gap-3 px-2.5 rounded-lg hover:bg-white/[0.05] transition-colors ${grouped ? 'py-0.5' : 'py-1.5 mt-1.5'}`}>
      <div className="w-8 shrink-0 flex justify-center pt-0.5">
        {grouped ? (
          <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 tabular-nums font-mono">
            {time ? format(new Date(time), 'HH:mm') : ''}
          </span>
        ) : (
          <span className={`h-8 w-8 rounded-full bg-gradient-to-br ${RING[idx]} flex items-center justify-center text-[12px] font-bold text-white shadow-sm`}>
            {initial}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-center gap-2 flex-wrap leading-none mb-1">
            <span className={`font-semibold text-[13px] ${COLORS[idx]}`}>{msg.roblox_username}</span>
            <span className="text-[11px] text-slate-500 tabular-nums font-mono">
              {time ? format(new Date(time), 'HH:mm:ss') : '--:--:--'}
            </span>
            {server && (
              <span
                title={server}
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono"
              >
                {shortServer}
              </span>
            )}
          </div>
        )}
        <p className="text-[13.5px] text-slate-200 break-words whitespace-pre-wrap leading-relaxed">{msg.message}</p>
      </div>
    </div>
  );
}