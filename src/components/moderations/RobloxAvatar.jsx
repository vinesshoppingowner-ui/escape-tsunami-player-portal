import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

// Cache headshots per username so repeated rows (e.g. the live chat feed) reuse
// one request instead of hammering the Roblox proxy and getting rate-limited.
const cache = new Map();   // username(lower) -> imageUrl
const inflight = new Map(); // username(lower) -> Promise<imageUrl>

async function fetchHeadshot(username) {
  const res = await fetch('https://users.roproxy.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
  });
  if (!res.ok) throw new Error('lookup failed');
  const id = (await res.json())?.data?.[0]?.id;
  if (!id) throw new Error('not found');
  const r = await fetch(
    `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${id}&size=150x150&format=Png&isCircular=false`
  );
  if (!r.ok) throw new Error('thumbnail failed');
  const u = (await r.json())?.data?.[0]?.imageUrl;
  if (!u) throw new Error('no image');
  return u;
}

function getHeadshot(username) {
  const key = username.toLowerCase();
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  if (!inflight.has(key)) {
    inflight.set(
      key,
      fetchHeadshot(username)
        .then((u) => { cache.set(key, u); return u; })
        .finally(() => inflight.delete(key))
    );
  }
  return inflight.get(key);
}

export default function RobloxAvatar({ username, size = 40 }) {
  const [url, setUrl] = useState(() => (username ? cache.get(username.toLowerCase()) || null : null));

  useEffect(() => {
    let active = true;
    if (!username) { setUrl(null); return; }
    const cached = cache.get(username.toLowerCase());
    setUrl(cached || null);
    if (cached) return;
    getHeadshot(username)
      .then((u) => { if (active) setUrl(u); })
      .catch(() => {});
    return () => { active = false; };
  }, [username]);

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden bg-white/5 border border-white/15 flex items-center justify-center shrink-0"
    >
      {url ? (
        <img src={url} alt={username} className="w-full h-full object-cover" />
      ) : (
        <User className="text-slate-500" style={{ height: size * 0.5, width: size * 0.5 }} />
      )}
    </div>
  );
}