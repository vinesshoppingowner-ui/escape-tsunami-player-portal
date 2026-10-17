import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { Image } from '@/components/ui/image';

const signedCache = new Map();

export function clearAvatarCache(uri) {
  if (uri) signedCache.delete(uri);
  else signedCache.clear();
}

export default function UserAvatar({ user, size = 40, className = '' }) {
  const avatarUri = user?.avatar_uri || user?.data?.avatar_uri || '';
  const username = user?.roblox_username || user?.data?.roblox_username || '';
  const displayName = user?.custom_display_name || user?.data?.custom_display_name || user?.full_name || username || user?.email || '?';
  const initials = displayName
    .split(/[\s@._]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  const [signedUrl, setSignedUrl] = useState(() => (avatarUri ? signedCache.get(avatarUri) || null : null));

  useEffect(() => {
    let active = true;
    if (!avatarUri) {
      setSignedUrl(null);
      return;
    }
    if (avatarUri.startsWith('http://') || avatarUri.startsWith('https://')) {
      setSignedUrl(avatarUri);
      return;
    }
    if (signedCache.has(avatarUri)) {
      setSignedUrl(signedCache.get(avatarUri));
      return;
    }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: avatarUri, expires_in: 3600 })
      .then((res) => {
        if (active && res?.signed_url) {
          signedCache.set(avatarUri, res.signed_url);
          setSignedUrl(res.signed_url);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [avatarUri]);

  if (signedUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-full overflow-hidden bg-slate-900 shrink-0 ${className}`}
      >
        <Image src={signedUrl} alt={displayName} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (username) {
    return <RobloxAvatar username={username} size={size} />;
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 ${className}`}
    >
      <span className="font-bold text-white" style={{ fontSize: Math.max(11, Math.round(size * 0.36)) }}>
        {initials}
      </span>
    </div>
  );
}