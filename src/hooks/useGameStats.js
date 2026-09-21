import { useState, useEffect, useRef } from 'react';

const PLACE_ID = '103398581793479';
const POLL_INTERVAL = 30000; // 30 seconds — near real-time

async function fetchUniverseId(placeId) {
  const res = await fetch(`https://apis.roproxy.com/universes/v1/places/${placeId}/universe`);
  if (!res.ok) throw new Error('Failed to resolve universe');
  const data = await res.json();
  return data.universeId;
}

async function fetchGameStats(universeId) {
  const res = await fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
  if (!res.ok) throw new Error('Failed to fetch game stats');
  const data = await res.json();
  return data?.data?.[0] || null;
}

async function fetchServerCount() {
  try {
    const res = await fetch(`https://games.roproxy.com/v1/games/${PLACE_ID}/servers/Public?limit=100`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data?.data?.length || 0;
  } catch {
    return 0;
  }
}

export function useGameStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const universeIdRef = useRef(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!universeIdRef.current) {
          universeIdRef.current = await fetchUniverseId(PLACE_ID);
        }
        const [data, servers] = await Promise.all([fetchGameStats(universeIdRef.current), fetchServerCount()]);
        if (active && data) {
          setStats({
            visits: data.visits || 0,
            favorites: data.favoritedCount ?? data.likes ?? 0,
            playing: data.playing || 0,
            maxPlayers: data.maxPlayers || 0,
            servers,
            name: data.name,
            updated: data.updated,
            lastSynced: new Date(),
          });
        }
      } catch {
        /* keep last known or defaults */
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { stats, loading };
}