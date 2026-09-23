import { useRef, useState } from 'react';
import { Loader2, Send, ImagePlus, X, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CHAT_QUICK_REPLIES } from '@/lib/chatQuickReplies';

export default function AppealChatInput({ isStaff, onSend, onTyping }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !file) || sending) return;
    setSending(true);
    await onSend(text.trim(), file);
    setText('');
    setFile(null);
    setSending(false);
  };

  return (
    <form onSubmit={submit} className="border-t border-white/10 p-2 space-y-2">
      {file && (
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5">
          <ImagePlus className="h-3.5 w-3.5 text-cyan-400" /> <span className="truncate flex-1">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-white"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ''; }} />
        <button type="button" onClick={() => fileRef.current?.click()} title="Attach image" className="h-9 w-9 shrink-0 rounded-full border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center">
          <ImagePlus className="h-4 w-4" />
        </button>
        {isStaff && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" title="Quick replies" className="h-9 w-9 shrink-0 rounded-full border border-violet-500/30 text-violet-300 hover:bg-violet-500/15 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-slate-900 border-white/15 text-white w-72">
              {CHAT_QUICK_REPLIES.map((r) => (
                <DropdownMenuItem key={r.label} onClick={() => setText(r.text)} className="flex flex-col items-start focus:bg-white/10 focus:text-white cursor-pointer">
                  <span className="text-xs font-semibold text-violet-300">{r.label}</span>
                  <span className="text-xs text-slate-400 line-clamp-2">{r.text}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); onTyping(); }}
          placeholder="Type a message…"
          maxLength={1000}
          className="flex-1 min-w-0 bg-slate-950/60 border border-white/15 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button type="submit" disabled={(!text.trim() && !file) || sending} className="h-9 w-9 shrink-0 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 flex items-center justify-center hover:bg-cyan-500/30 disabled:opacity-40">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}