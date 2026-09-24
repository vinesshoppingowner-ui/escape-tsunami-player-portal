import { useEffect } from 'react';
import { useUserPrefs } from '@/lib/userPrefs';

// Puts the chosen theme color on <html> so the CSS overrides recolor the site accent.
export default function AccentApplier() {
  const { accent } = useUserPrefs();
  useEffect(() => {
    const el = document.documentElement;
    if (accent && accent !== 'cyan') el.dataset.accent = accent;
    else delete el.dataset.accent;
  }, [accent]);
  return null;
}