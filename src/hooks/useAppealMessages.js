import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useAppealMessages(appealId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!appealId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    base44.entities.AppealMessage.filter({ appeal_id: appealId }, { sort: 'created_date', limit: 200 })
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res) ? res : res?.items || [];
        setMessages(list);
      })
      .catch(() => {
        if (active) setMessages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsub = base44.entities.AppealMessage.subscribe((e) => {
      if (!e) return;
      if (e.type === 'delete') {
        setMessages((prev) => prev.filter((m) => m.id !== e.id));
        return;
      }
      if (!e.data || e.data.appeal_id !== appealId) return;
      setMessages((prev) =>
        prev.some((m) => m.id === e.data.id)
          ? prev.map((m) => (m.id === e.data.id ? e.data : m))
          : [...prev, e.data]
      );
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, [appealId]);

  const addLocal = (msg) => {
    if (!msg?.id) return;
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  };

  return { messages, loading, addLocal };
}