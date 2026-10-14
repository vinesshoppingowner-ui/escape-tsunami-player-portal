import { ShieldCheck, Check, CheckCheck, Lock, Trash2 } from 'lucide-react';
import ChatImage from '@/components/appeals/ChatImage';
import VideoAttachment from '@/components/appeals/VideoAttachment';

export default function AppealChatMessage({ msg, mine, receipt, onDelete }) {
  return (
    <div className={`group flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-1 max-w-[80%] ${mine ? 'flex-row-reverse' : ''}`}>
      <div className={`rounded-2xl px-3 py-2 border ${
        msg.internal ? 'bg-amber-500/10 border-amber-500/30 border-dashed' :
        mine ? 'bg-cyan-500/15 border-cyan-500/30 rounded-br-sm' : 'bg-white/[0.05] border-white/10 rounded-bl-sm'
      }`}>
        {msg.internal && <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300 mb-0.5"><Lock className="h-3 w-3" /> Staff note</div>}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[11px] font-semibold ${msg.sender_is_staff ? 'text-violet-300' : 'text-cyan-300'}`}>
            {msg.sender_name || (msg.sender_is_staff ? 'Staff' : msg.roblox_username)}
          </span>
          {msg.sender_is_staff && <ShieldCheck className="h-3 w-3 text-violet-300" />}
          <span className="text-[10px] text-slate-500">
            {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {msg.message && <p className="text-sm text-slate-100 whitespace-pre-wrap break-words">{msg.message}</p>}
        {msg.image_uri && <ChatImage uri={msg.image_uri} />}
        {msg.video_url && <VideoAttachment url={msg.video_url} />}
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} title="Delete message" className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-300 p-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      </div>
      {receipt && (
        <span className={`mt-0.5 flex items-center gap-1 text-[10px] ${receipt === 'Seen' ? 'text-cyan-300' : 'text-slate-500'}`}>
          {receipt === 'Seen' ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />} {receipt}
        </span>
      )}
    </div>
  );
}