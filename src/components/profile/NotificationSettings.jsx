import { Bell } from 'lucide-react';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingToggle from '@/components/profile/SettingToggle';

export default function NotificationSettings({ prefs, set }) {
  const row = (key, label, hint) => <SettingToggle key={key} label={label} hint={hint} checked={prefs[key]} onChange={(v) => set({ [key]: v })} />;
  return (
    <SettingsSection icon={Bell} title="Notifications" desc="Choose which alerts you get.">
      {row('notify_appeals', 'Appeal updates', 'When staff approve or deny your appeal')}
      {row('notify_moderations', 'Moderations', 'When a punishment is issued or expires')}
      {row('notify_staff_messages', 'Staff messages', 'Announcements and messages from staff')}
      {row('notification_sound', 'Play a sound', 'Short chime when a new notification arrives')}
      {row('welcome_popup', 'Welcome popup after logging in')}
    </SettingsSection>
  );
}