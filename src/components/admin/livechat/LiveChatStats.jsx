import { MessageSquare, Users, Server, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function LiveChatStats({ messages }) {
  const players = new Set(messages.map((m) => m.roblox_username).filter(Boolean)).size;
  const servers = new Set(messages.map((m) => m.server_name).filter(Boolean)).size;
  const last = messages[messages.length - 1];
  const lastTime = last?.timestamp || last?.created_date;

  const items = [
    { icon: MessageSquare, label: 'Messages', value: messages.length },
    { icon: Users, label: 'Players', value: players },
    { icon: Server, label: 'Servers', value: servers },
    { icon: Clock, label: 'Last message', value: lastTime ? format(new Date(lastTime), 'HH:mm:ss') : '—' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
            <it.icon className="h-3.5 w-3.5 text-cyan-400/70" /> {it.label}
          </div>
          <p className="mt-1 text-xl font-semibold text-white tabular-nums">{it.value}</p>
        </div>
      ))}
    </div>
  );
}