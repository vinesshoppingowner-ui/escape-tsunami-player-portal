import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import AppealChatControls from '@/components/appeals/AppealChatControls';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, MessagesSquare } from 'lucide-react';
import AppealChatMessage from '@/components/appeals/AppealChatMessage';
import AppealChatInput from '@/components/appeals/AppealChatInput';
import { useAppealMessages } from '@/hooks/useAppealMessages';
import { useAppealPresence } from '@/hooks/useAppealPresence';

export default function AppealChat({ appeal }) {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'staff' || user?.is_owner === true;
  const { messages: all, loading, addLocal } = useAppealMessages(appeal.id);
  const messages = isStaff ? all : all.filter((m) => !m.internal);
  const [locked, setLocked] = useState(!!appeal.chat_locked);

  useEffect(() => base44.entities.Appeal.subscribe((e) => {
    if (e.id === appeal.id && e.data) setLocked(!!e.data.chat_locked);
  }), [appeal.id]);

  const deleteMessage = async (id) => { await base44.entities.AppealMessage.delete(id); };
  const presence = useAppealPresence(appeal, isStaff);
  const listRef = useRef(null);
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, presence.otherTyping]);

  useEffect(() => {
    if (presence.ready && lastId) presence.markSeen(lastId);
  }, [lastId, presence.ready]);

  const send = async (message, file, internal = false) => {
    const image_uri = file ? (await base44.integrations.Core.UploadPrivateFile({ file })).file_uri : undefined;
    const created = await base44.entities.AppealMessage.create({
      appeal_id: appeal.id,
      roblox_username: appeal.roblox_username,
      sender_name: isStaff ? (user?.full_name || 'Staff') : appeal.roblox_username,
      sender_is_staff: isStaff,
      message,
      image_uri,
      internal: isStaff && internal,
    });
    addLocal(created);
    presence.stopTyping();
  };

  // Receipt shows under my latest message: "Seen" once the other side has viewed it.
  const lastMineIdx = messages.map((m) => !!m.sender_is_staff === isStaff && !m.internal).lastIndexOf(true);
  const seenIdx = messages.findIndex((m) => m.id === presence.other?.last_seen_message_id);
  const receipt = lastMineIdx >= 0 ? (seenIdx >= lastMineIdx ? 'Seen' : 'Sent') : null;

  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2 text-sm font-semibold text-white">
        <MessagesSquare className="h-4 w-4 text-cyan-400" /> Live chat
        {locked && <span className="text-[10px] font-medium text-amber-300 flex items-center gap-1"><Lock className="h-3 w-3" /> Locked</span>}
        {isStaff && <div className="ml-auto"><AppealChatControls appealId={appeal.id} locked={locked} onLockChange={setLocked} messages={all} /></div>}
        <span className="ml-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <div ref={listRef} className="h-72 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-500 text-center px-6">
            {isStaff ? 'No messages yet. Start the conversation with the player.' : 'No messages yet. Chat with staff about your appeal here.'}
          </div>
        ) : (
          messages.map((m, i) => (
            <AppealChatMessage key={m.id} msg={m} mine={!!m.sender_is_staff === isStaff} receipt={i === lastMineIdx ? receipt : null} onDelete={isStaff ? () => deleteMessage(m.id) : null} />
          ))
        )}
        {presence.otherTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
            </span>
            {isStaff ? `${appeal.roblox_username} is typing…` : 'Staff is typing…'}
          </div>
        )}
      </div>
      {!isStaff && locked ? (
        <div className="border-t border-white/10 p-3 text-center text-xs text-slate-400">Staff have locked this chat.</div>
      ) : (
        <AppealChatInput isStaff={isStaff} onSend={send} onTyping={presence.markTyping} />
      )}
    </div>
  );
}