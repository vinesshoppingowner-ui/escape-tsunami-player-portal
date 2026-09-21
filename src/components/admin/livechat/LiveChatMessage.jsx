import { format } from 'date-fns';

export default function LiveChatMessage({ msg }) {
  const time = msg.timestamp || msg.created_date;
  return (
    <div className="flex items-start gap-2 py-1 px-2 rounded-md hover:bg-white/[0.04]">
      <span className="text-slate-500 shrink-0 tabular-nums">{time ? format(new Date(time), 'HH:mm:ss') : '--:--:--'}</span>
      {msg.server_name && <span className="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 self-center">{msg.server_name}</span>}
      <span className="text-cyan-300 font-semibold shrink-0">{msg.roblox_username}:</span>
      <span className="text-slate-200 break-words min-w-0">{msg.message}</span>
    </div>
  );
}