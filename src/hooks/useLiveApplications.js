import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export function isNewSubmission(createdDate, nowMs = Date.now()) {
  if (!createdDate) return false;
  const diff = nowMs - new Date(createdDate).getTime();
  return diff >= -60000 && diff <= TEN_MINUTES_MS;
}

/**
 * Live-updating hook for ApplicationResponse records.
 * Subscribes to realtime create/update/delete events so counts and lists update instantly without page refresh.
 */
export function useLiveApplicationResponses(enabled = true, applicationId = null) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    const query = applicationId ? { application_id: applicationId } : {};
    base44.entities.ApplicationResponse.filter(query, { sort: '-created_date', limit: 500 })
      .then((page) => {
        if (!cancelled) setResponses(page?.items || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = base44.entities.ApplicationResponse.subscribe((event) => {
      if (!event?.data && event?.type !== 'delete') return;
      if (applicationId && event.data?.application_id && event.data.application_id !== applicationId) return;

      setResponses((prev) => {
        if (event.type === 'create' && event.data) {
          if (prev.some((r) => r.id === event.data.id)) return prev;
          return [event.data, ...prev];
        }
        if (event.type === 'update' && event.data) {
          return prev.map((r) => (r.id === event.data.id ? event.data : r));
        }
        if (event.type === 'delete') {
          return prev.filter((r) => r.id !== event.id);
        }
        return prev;
      });
    });

    const timer = setInterval(() => setNowMs(Date.now()), 15000);
    return () => {
      cancelled = true;
      unsubscribe?.();
      clearInterval(timer);
    };
  }, [enabled, applicationId]);

  const countsByApp = {};
  const newCountsByApp = {};
  let totalCount = 0;
  let unreviewedCount = 0;
  let newTotalCount = 0;

  for (const r of responses) {
    totalCount++;
    if (r.status === 'submitted') unreviewedCount++;
    const appId = r.application_id;
    if (appId) {
      countsByApp[appId] = (countsByApp[appId] || 0) + 1;
    }
    if (isNewSubmission(r.created_date, nowMs)) {
      newTotalCount++;
      if (appId) newCountsByApp[appId] = (newCountsByApp[appId] || 0) + 1;
    }
  }

  return {
    responses,
    setResponses,
    loading,
    totalCount,
    unreviewedCount,
    newTotalCount,
    countsByApp,
    newCountsByApp,
    nowMs,
  };
}