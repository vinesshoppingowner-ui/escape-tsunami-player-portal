import { APP_ICONS } from '@/lib/appIcons';

// Renders an application icon: a preset icon ("lucide:Name") or a legacy emoji.
export default function AppIcon({ icon, className = 'h-8 w-8', emojiClass = 'text-2xl' }) {
  const Preset = icon?.startsWith('lucide:') && APP_ICONS[icon.slice(7)];
  if (Preset) {
    return (
      <span className={`${className} shrink-0 inline-flex items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300`}>
        <Preset className="h-3/5 w-3/5" />
      </span>
    );
  }
  return <span className={`${emojiClass} shrink-0`}>{icon || '📋'}</span>;
}