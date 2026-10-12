import { useState, useEffect, useRef } from 'react';

const PLACE_ID = '103398581793479';
const POLL_INTERVAL = 30000;

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

async function fetchVotes(universeId) {
  try {
    const res = await fetch(`https://games.roproxy.com/v1/games/votes?universeIds=${universeId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0] || null;
  } catch { return null; }
}

async function fetchThumbnail(placeId) {
  try {
    const res = await fetch(`https://thumbnails.roproxy.com/v1/places/icons?placeIds=${placeId}&size=256x256&format=Png&isCircular=false`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0]?.imageUrl || null;
  } catch { return null; }
}

export function useGameStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const universeIdRef = useRef(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!universeIdRef.current) {
          universeIdRef.current = await fetchUniverseId(PLACE_ID);
        }
        const [data, votes, thumb] = await Promise.all([
          fetchGameStats(universeIdRef.current),
          fetchVotes(universeIdRef.current),
          fetchThumbnail(PLACE_ID),
        ]);
        if (active && data) {
          const upVotes = votes?.upVotes || 0;
          const downVotes = votes?.downVotes || 0;
          const totalVotes = upVotes + downVotes;
          setStats({
            visits: data.visits || 0,
            favorites: data.favoritedCount ?? 0,
            playing: data.playing || 0,
            maxPlayers: data.maxPlayers || 0,
            name: data.name,
            likeRatio: totalVotes > 0 ? Math.round((upVotes / totalVotes) * 100) : null,
            thumbnail: thumb,
            lastUpdated: new Date(),
          });
        }
        if (active) setError(false);
      } catch {
        if (active) setError(true);
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

  return { stats, loading, error };
}