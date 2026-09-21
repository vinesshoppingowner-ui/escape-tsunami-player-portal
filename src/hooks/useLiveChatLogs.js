import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

const POLL_MS = 3000;

/**
 * Keeps a live list of ChatLog records: realtime subscription + a steady poll
 * so new in-game messages appear without reopening the page.
 */
export default function useLiveChatLogs() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const idsRef = useRef(new Set());

  useEffect(() => {
    let active = true;

    const add = (rows) => {
      const fresh = rows.filter((r) => r && r.id && !idsRef.current.has(r.id));
      if (!fresh.length) return;
      fresh.forEach((r) => idsRef.current.add(r.id));
      setMessages((prev) =>
        [...prev, ...fresh]
          .sort(
            (a, b) =>
              new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date)
          )
          .slice(-500)
      );
    };

    const sync = async (limit) => {
      const rows = await base44.entities.ChatLog.list('-created_date', limit);
      if (!active) return;
      add(rows);
      setLastSync(new Date());
      setLoading(false);
    };

    sync(200).catch(() => active && setLoading(false));

    const unsubscribe = base44.entities.ChatLog.subscribe((event) => {
      if (event.type === 'create') add([event.data]);
    });

    const interval = setInterval(() => {
      sync(50).catch(() => {});
    }, POLL_MS);

    return () => {
      active = false;
      clearInterval(interval);
      unsubscribe?.();
    };
  }, []);

  return { messages, loading, lastSync };
}