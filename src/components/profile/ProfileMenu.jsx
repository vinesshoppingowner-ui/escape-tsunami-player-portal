import { useState, useRef, useEffect } from 'react';
import SettingsDialog from '@/components/profile/SettingsDialog';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import AccountSwitcher from '@/components/profile/AccountSwitcher';

export function ringGradient(user) {
  if (isOwner(user)) return 'from-amber-400 to-orange-500';
  if (user?.role === 'staff') return 'from-violet-400 to-purple-500';
  return 'from-blue-400 to-cyan-500';
}

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
  const ring = ringGradient(user);

  return (
    <>
      <button
        ref={btnRef}
        aria-label="Open account menu"
        onClick={() => setSwitcherOpen(true)}
        className={`relative h-9 w-9 rounded-full p-[3px] bg-gradient-to-br ${ring} hover:opacity-90 transition-all shrink-0`}
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
        ringGradient={ring}
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