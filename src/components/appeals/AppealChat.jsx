import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Send, MessagesSquare } from 'lucide-react';
import AppealChatMessage from '@/components/appeals/AppealChatMessage';

export default function AppealChat({ appeal }) {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'staff' || user?.is_owner === true;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    base44.entities.AppealMessage.filter({ appeal_id: appeal.id }, 'created_date', 200).then((m) => {
      setMessages(m || []);
      setLoading(false);
    });
    return base44.entities.AppealMessage.subscribe((e) => {
      if (e.data?.appeal_id !== appeal.id && e.type !== 'delete') return;
      setMessages((prev) => {
        if (e.type === 'delete') return prev.filter((m) => m.id !== e.id);
        if (prev.some((m) => m.id === e.id)) return prev.map((m) => (m.id === e.id ? e.data : m));
        return [...prev, e.data];
      });
    });
  }, [appeal.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    const created = await base44.entities.AppealMessage.create({
      appeal_id: appeal.id,
      roblox_username: appeal.roblox_username,
      sender_name: isStaff ? (user?.full_name || 'Staff') : appeal.roblox_username,
      sender_is_staff: isStaff,
      message,
    });
    setMessages((prev) => (prev.some((m) => m.id === created.id) ? prev : [...prev, created]));
    setText('');
    setSending(false);
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2 text-sm font-semibold text-white">
        <MessagesSquare className="h-4 w-4 text-cyan-400" /> Live chat
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <div ref={listRef} className="h-64 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-500 text-center px-6">
            {isStaff ? 'No messages yet. Start the conversation with the player.' : 'No messages yet. Chat with staff about your appeal here.'}
          </div>
        ) : (
          messages.map((m) => <AppealChatMessage key={m.id} msg={m} mine={m.sender_is_staff === isStaff} />)
        )}
      </div>
      <form onSubmit={send} className="flex gap-2 p-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={1000}
          className="flex-1 bg-slate-950/60 border border-white/15 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button type="submit" disabled={!text.trim() || sending} className="h-9 w-9 shrink-0 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 flex items-center justify-center hover:bg-cyan-500/30 disabled:opacity-40">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}