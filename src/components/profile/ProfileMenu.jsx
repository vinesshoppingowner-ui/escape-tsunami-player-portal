import { useState, useRef, useEffect } from 'react';
import SettingsDialog from '@/components/profile/SettingsDialog';
import { useAuth } from '@/lib/AuthContext';
import AccountSwitcher from '@/components/profile/AccountSwitcher';

// Google-style 4-color ring: red (top-right), blue (bottom-right), green (bottom-left), yellow (top-left)
export const RING_STYLE = {
  background: 'conic-gradient(from 0deg, #EA4335 0deg 90deg, #4285F4 90deg 180deg, #34A853 180deg 270deg, #FBBC05 270deg 360deg)',
};

export default function ProfileMenu() {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const btnRef = useRef(null);

  if (!user) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-slate-200 hover:text-white"
      >
        Log in
      </a>
    );
  }

  const name = user.full_name || user.roblox_username || user.email;
  const initials = (name || '?').split(/[\s@._]+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();

  return (
    <>
      <button
        ref={btnRef}
        aria-label="Open account menu"
        onClick={() => setSwitcherOpen(true)}
        className="relative h-9 w-9 rounded-full p-[3px] shrink-0 hover:opacity-90 transition-opacity"
        style={RING_STYLE}
      >
        <span className="block w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
          <RobloxAvatarInline username={user.roblox_username} fallback={initials} />
        </span>
      </button>
      <AccountSwitcher
        user={user}
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        anchorRef={btnRef}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function RobloxAvatarInline({ username, fallback }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!username) return;
    fetch(`https://users.roproxy.com/v1/usernames/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    })
      .then((r) => r.json())
      .then((d) => d?.data?.[0]?.id)
      .then((id) => fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${id}&size=150x150&format=Png&isCircular=false`))
      .then((r) => r.json())
      .then((d) => d?.data?.[0]?.imageUrl)
      .then((u) => u && setUrl(u))
      .catch(() => {});
  }, [username]);
  if (!url) return <span className="text-xs font-bold text-white">{username?.[0]?.toUpperCase() || fallback}</span>;
  return <img src={url} alt={username} className="w-full h-full object-cover" />;
}