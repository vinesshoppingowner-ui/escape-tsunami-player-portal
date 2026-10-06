export default async function spotifyMusic(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, query } = body;

    if (action === "search") {
      if (!query || query.trim().length < 1) {
        return Response.json({ error: "Search query is required" });
      }
      const searchRes = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=24`,
        {
          signal: AbortSignal.timeout(10000),
          headers: { Accept: "application/json" },
        }
      );
      if (!searchRes.ok) {
        return Response.json({ error: `Search failed: ${searchRes.status}` });
      }
      const searchData = await searchRes.json();
      return Response.json({
        tracks:
          searchData.data?.map((t) => ({
            id: String(t.id),
            name: t.title,
            artist: t.artist?.name,
            album: t.album?.title,
            albumArt: t.album?.cover_medium || t.album?.cover_small,
            duration: t.duration ? t.duration * 1000 : null,
            previewUrl: t.preview,
          })) || [],
      });
    }

    if (action === "recent") {
      return Response.json({
        tracks: [],
        info: "Recently played requires Spotify credentials. Use search to find music.",
      });
    }

    return Response.json({ error: "Invalid action. Use 'search' or 'recent'." });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}