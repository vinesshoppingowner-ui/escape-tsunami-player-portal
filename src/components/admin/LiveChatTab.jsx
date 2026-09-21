import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, Pause, Play, X, ArrowDown, AlertTriangle } from 'lucide-react';
import LiveChatMessage from '@/components/admin/livechat/LiveChatMessage';
import LiveChatStats from '@/components/admin/livechat/LiveChatStats';
import PlayerChatModal from '@/components/admin/livechat/PlayerChatModal';
import { screenChat } from '@/lib/profanity';
import useLiveChatLogs from '@/hooks/useLiveChatLogs';
import { format } from 'date-fns';

export default function LiveChatTab() {
  const { messages, loading, lastSync } = useLiveChatLogs();
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);
  const [unseen, setUnseen] = useState(0);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (paused) {
      setUnseen((u) => u + 1);
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const jumpToLatest = () => {
    setPaused(false);
    setUnseen(0);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const q = search.trim().toLowerCase();
  let visible = q
    ? messages.filter(
        (m) =>
          m.roblox_username?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q) ||
          m.server_name?.toLowerCase().includes(q)
      )
    : messages;
  if (flaggedOnly) visible = visible.filter((m) => screenChat(m).severity);

  return (
    <>
      <LiveChatStats messages={messages} />

      <div className="mt-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 overflow-hidden shadow-xl shadow-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <MessageSquare className="h-4 w-4 text-cyan-400" /> Live Chat
            {q && <span className="text-slate-400 font-normal text-xs">· {visible.length} matching</span>}
            {lastSync && (
              <span className="text-slate-500 font-normal text-[11px]">
                · synced {format(lastSync, 'h:mm:ss a')}
              </span>
            )}
          </div>
          <div className="flex-1" />
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by player, message, server"
              className="pl-8 pr-8 h-9 bg-white/5 border-white/10 text-white rounded-lg"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFlaggedOnly((f) => !f)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              flaggedOnly
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-200 hover:bg-rose-500/25'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Flagged
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              paused
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 hover:bg-amber-500/25'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div className="relative">
          <div ref={scrollRef} className="h-[60vh] overflow-y-auto px-3 py-3">
            {loading && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-2.5 animate-pulse">
                    <span className="h-8 w-8 rounded-full bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-1.5 pt-1">
                      <div className="h-2.5 w-24 rounded bg-white/10" />
                      <div className="h-3 rounded bg-white/5" style={{ width: `${55 + i * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && visible.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="text-slate-300 font-medium">{q ? 'No messages match your filter' : 'Waiting for in-game chat'}</p>
                <p className="text-slate-500 text-sm mt-1">
                  {q ? 'Try a different player, word, or server.' : 'Messages appear here the moment players send them in-game.'}
                </p>
              </div>
            )}

            {visible.map((m) => (
              <LiveChatMessage
                key={m.id}
                msg={m}
                grouped={false}
                onOpenPlayer={(name) => setSelected({ username: name, evidence: m.message })}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {paused && unseen > 0 && (
            <button
              onClick={jumpToLatest}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              {unseen} new {unseen === 1 ? 'message' : 'messages'}
            </button>
          )}
        </div>
      </div>

      {selected && (
        <PlayerChatModal
          open={!!selected}
          username={selected.username}
          evidence={selected.evidence}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}