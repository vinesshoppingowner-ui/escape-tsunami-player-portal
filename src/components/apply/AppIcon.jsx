import { Image } from '@/components/ui/image';

// Renders an application icon: an uploaded image URL or an emoji.
export default function AppIcon({ icon, className = 'h-8 w-8', emojiClass = 'text-2xl' }) {
  if (icon && /^https?:\/\//.test(icon)) {
    return <Image src={icon} alt="" className={`${className} rounded-lg shrink-0 inline-block`} />;
  }
  return <span className={`${emojiClass} shrink-0`}>{icon || '📋'}</span>;
}