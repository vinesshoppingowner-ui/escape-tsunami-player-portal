import { useState, useRef } from 'react';
import SettingsDialog from '@/components/profile/SettingsDialog';
import { useAuth } from '@/lib/AuthContext';
import AccountSwitcher from '@/components/profile/AccountSwitcher';
import UserAvatar from '@/components/profile/UserAvatar';
import NotificationsBell from '@/components/moderations/NotificationsBell';

export const RING_STYLE = {};

export default function ProfileMenu() {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState('appearance');
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

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <NotificationsBell />
        <button
          ref={btnRef}
          aria-label="Open account menu"
          onClick={() => setSwitcherOpen(true)}
          className="relative h-9 w-9 rounded-full overflow-hidden border border-white/15 shrink-0 hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <UserAvatar user={user} size={36} />
        </button>
      </div>
      <AccountSwitcher
        user={user}
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        onOpenSettings={(tab = 'appearance') => {
          setInitialTab(tab);
          setSettingsOpen(true);
        }}
        anchorRef={btnRef}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} defaultTab={initialTab} />
    </>
  );
}