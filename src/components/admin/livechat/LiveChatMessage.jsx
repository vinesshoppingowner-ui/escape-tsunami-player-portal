import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { screenMessage, SEVERITY_STYLES } from '@/lib/profanity';

const COLORS = [
  'text-cyan-300', 'text-emerald-300', 'text-amber-300', 'text-violet-300',
  'text-rose-300', 'text-sky-300', 'text-lime-300', 'text-fuchsia-300',
];

function hash(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973;
  return h;
}

export default function LiveChatMessage({ msg, grouped, onOpenPlayer }) {
  const time = msg.timestamp || msg.created_date;
  const idx = hash(msg.roblox_username) % COLORS.length;
  const server = msg.server_name || '';
  const shortServer = server.length > 8 ? `${server.slice(0, 4)}…${server.slice(-4)}` : server;
  const { severity, matches } = screenMessage(msg.message);
  const flag = severity ? SEVERITY_STYLES[severity] : null;

  return (
    <div
      className={`group flex items-start gap-3 pl-2 pr-2.5 rounded-lg hover:bg-white/[0.05] transition-colors ${
        grouped ? 'py-0.5' : 'py-1.5 mt-1.5'
      } ${flag ? flag.row : ''}`}
    >
      <button
        onClick={() => onOpenPlayer?.(msg.roblox_username)}
        className="w-8 shrink-0 flex justify-center pt-0.5"
        title={`View ${msg.roblox_username}`}
      >
        {grouped ? (
          <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 tabular-nums font-mono">
            {time ? format(new Date(time), 'h:mm') : ''}
          </span>
        ) : (
          <span className="hover:ring-2 hover:ring-cyan-400/50 rounded-full transition-all">
            <RobloxAvatar username={msg.roblox_username} size={32} />
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-center gap-2 flex-wrap leading-none mb-1">
            <button
              onClick={() => onOpenPlayer?.(msg.roblox_username)}
              className={`font-semibold text-[13px] hover:underline ${COLORS[idx]}`}
            >
              {msg.roblox_username}
            </button>
            <span className="text-[11px] text-slate-500 tabular-nums font-mono">
              {time ? format(new Date(time), 'h:mm:ss a') : '--:--:--'}
            </span>
            {server && (
              <span
                title={server}
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono"
              >
                {shortServer}
              </span>
            )}
            {flag && (
              <span
                title={`Flagged words: ${matches.join(', ')}`}
                className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${flag.badge}`}
              >
                <AlertTriangle className="h-2.5 w-2.5" /> {flag.label}
              </span>
            )}
          </div>
        )}
        <p className="text-[13.5px] text-slate-200 break-words whitespace-pre-wrap leading-relaxed">
          {msg.message}
          {grouped && flag && (
            <span className={`ml-2 inline-flex items-center gap-1 align-middle text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border ${flag.badge}`}>
              <AlertTriangle className="h-2.5 w-2.5" /> {flag.label}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}