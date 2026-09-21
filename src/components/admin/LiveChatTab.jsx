import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, Pause, Play } from 'lucide-react';
import LiveChatMessage from '@/components/admin/livechat/LiveChatMessage';

export default function LiveChatTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.ChatLog.list('-created_date', 200).then((rows) => {
      setMessages([...rows].reverse());
      setLoading(false);
    });
    const unsubscribe = base44.entities.ChatLog.subscribe((event) => {
      if (event.type !== 'create') return;
      setMessages((prev) => (prev.some((m) => m.id === event.data.id) ? prev : [...prev, event.data].slice(-500)));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, paused]);

  const q = search.trim().toLowerCase();
  const visible = q
    ? messages.filter((m) => m.roblox_username?.toLowerCase().includes(q) || m.message?.toLowerCase().includes(q) || m.server_name?.toLowerCase().includes(q))
    : messages;

  return (
    <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <MessageSquare className="h-4 w-4 text-cyan-400" /> Live Chat
          <span className="text-slate-400 font-normal">· {visible.length} messages</span>
        </div>
        <div className="flex-1" />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by player, message, server" className="pl-8 h-9 bg-white/5 border-white/10 text-white rounded-lg" />
        </div>
        <button onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10">
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {paused ? 'Resume scroll' : 'Pause scroll'}
        </button>
      </div>
      <div className="h-[60vh] overflow-y-auto px-4 py-3 space-y-1 font-mono text-[13px]">
        {loading && <p className="text-slate-500 text-sm">Loading chat…</p>}
        {!loading && visible.length === 0 && <p className="text-slate-500 text-sm">No chat messages yet — messages appear here the moment players send them in-game.</p>}
        {visible.map((m) => <LiveChatMessage key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}