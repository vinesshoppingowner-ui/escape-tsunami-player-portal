import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Tracks typing + seen state for both sides (player / staff) of an appeal chat.
export function useAppealPresence(appeal, isStaff) {
  const [records, setRecords] = useState([]);
  const [ready, setReady] = useState(false);
  const [, setTick] = useState(0);
  const lastTyping = useRef(0);
  const creating = useRef(null);

  useEffect(() => {
    base44.entities.AppealPresence.filter({ appeal_id: appeal.id }).then((r) => {
      setRecords(r || []);
      setReady(true);
    });
    const unsub = base44.entities.AppealPresence.subscribe((e) => {
      if (e.type === 'delete') return setRecords((prev) => prev.filter((r) => r.id !== e.id));
      if (e.data?.appeal_id !== appeal.id) return;
      setRecords((prev) => [...prev.filter((r) => r.id !== e.id), e.data]);
    });
    const t = setInterval(() => setTick((x) => x + 1), 1500);
    return () => { unsub(); clearInterval(t); };
  }, [appeal.id]);

  const mine = records.find((r) => !!r.is_staff === isStaff);
  const other = records.find((r) => !!r.is_staff !== isStaff);

  const upsert = async (patch) => {
    if (!ready) return;
    if (mine) {
      setRecords((prev) => prev.map((r) => (r.id === mine.id ? { ...r, ...patch } : r)));
      return base44.entities.AppealPresence.update(mine.id, patch);
    }
    if (creating.current) return;
    creating.current = base44.entities.AppealPresence.create({
      appeal_id: appeal.id, roblox_username: appeal.roblox_username, is_staff: isStaff, ...patch,
    });
    const created = await creating.current;
    setRecords((prev) => [...prev.filter((r) => r.id !== created.id), created]);
    creating.current = null;
  };

  const markTyping = () => {
    if (Date.now() - lastTyping.current < 2500) return;
    lastTyping.current = Date.now();
    upsert({ typing_at: new Date().toISOString() });
  };
  const stopTyping = () => { lastTyping.current = 0; upsert({ typing_at: null }); };
  const markSeen = (messageId) => {
    if (messageId && mine?.last_seen_message_id !== messageId) upsert({ last_seen_message_id: messageId });
  };

  const otherTyping = !!other?.typing_at && Date.now() - new Date(other.typing_at).getTime() < 5000;

  return { ready, other, otherTyping, markTyping, stopTyping, markSeen };
}