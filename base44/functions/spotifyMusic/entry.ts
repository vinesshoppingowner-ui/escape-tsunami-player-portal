export default async function spotifyMusic(req) {
  const { action, query } = req.body || {};

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    return { error: "Spotify credentials not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the Secrets page." };
  }

  // Determine which token flow to use
  const useUserToken = action === "recent" && refreshToken;

  // Get access token
  let accessToken;
  try {
    const tokenBody = useUserToken
      ? {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }
      : {
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        };

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenBody).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return { error: `Spotify token error: ${tokenRes.status} — ${errText}` };
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
  } catch (e) {
    return { error: `Failed to get Spotify access token: ${e.message}` };
  }

  // Search for tracks
  if (action === "search") {
    if (!query || query.trim().length < 1) {
      return { error: "Search query is required" };
    }
    try {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=24`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!searchRes.ok) {
        return { error: `Spotify search failed: ${searchRes.status}` };
      }
      const searchData = await searchRes.json();
      return {
        tracks:
          searchData.tracks?.items?.map((t) => ({
            id: t.id,
            name: t.name,
            artist: t.artists?.map((a) => a.name).join(", "),
            album: t.album?.name,
            albumArt: t.album?.images?.[0]?.url,
            duration: t.duration_ms,
            uri: t.uri,
            explicit: t.explicit,
          })) || [],
      };
    } catch (e) {
      return { error: `Search error: ${e.message}` };
    }
  }

  // Recently played (requires user token)
  if (action === "recent") {
    if (!refreshToken) {
      return { error: "Recently played requires SPOTIFY_REFRESH_TOKEN. Set it in the Secrets page." };
    }
    try {
      const recentRes = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=24",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!recentRes.ok) {
        const errText = await recentRes.text();
        return { error: `Recently played failed: ${recentRes.status} — ${errText}` };
      }
      const recentData = await recentRes.json();
      return {
        tracks:
          recentData.items?.map((item) => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists?.map((a) => a.name).join(", "),
            album: item.track.album?.name,
            albumArt: item.track.album?.images?.[0]?.url,
            duration: item.track.duration_ms,
            playedAt: item.played_at,
            uri: item.track.uri,
            explicit: item.track.explicit,
          })) || [],
      };
    } catch (e) {
      return { error: `Recently played error: ${e.message}` };
    }
  }

  return { error: "Invalid action. Use 'search' or 'recent'." };
}