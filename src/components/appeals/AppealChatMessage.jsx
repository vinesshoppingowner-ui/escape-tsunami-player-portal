import { ShieldCheck } from 'lucide-react';

export default function AppealChatMessage({ msg, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 border ${
        mine ? 'bg-cyan-500/15 border-cyan-500/30 rounded-br-sm' : 'bg-white/[0.05] border-white/10 rounded-bl-sm'
      }`}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[11px] font-semibold ${msg.sender_is_staff ? 'text-violet-300' : 'text-cyan-300'}`}>
            {msg.sender_name || (msg.sender_is_staff ? 'Staff' : msg.roblox_username)}
          </span>
          {msg.sender_is_staff && <ShieldCheck className="h-3 w-3 text-violet-300" />}
          <span className="text-[10px] text-slate-500">
            {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-slate-100 whitespace-pre-wrap break-words">{msg.message}</p>
      </div>
    </div>
  );
}