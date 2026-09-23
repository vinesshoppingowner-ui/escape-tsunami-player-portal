import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useAppealMessages(appealId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AppealMessage.filter({ appeal_id: appealId }, 'created_date', 200).then((m) => {
      setMessages(m || []);
      setLoading(false);
    });
    return base44.entities.AppealMessage.subscribe((e) => {
      if (e.type === 'delete') return setMessages((prev) => prev.filter((m) => m.id !== e.id));
      if (e.data?.appeal_id !== appealId) return;
      setMessages((prev) => (prev.some((m) => m.id === e.id) ? prev.map((m) => (m.id === e.id ? e.data : m)) : [...prev, e.data]));
    });
  }, [appealId]);

  const addLocal = (msg) => setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));

  return { messages, loading, addLocal };
}