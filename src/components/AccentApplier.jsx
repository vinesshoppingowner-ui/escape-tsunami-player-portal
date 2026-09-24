import { useEffect } from 'react';
import { useUserPrefs } from '@/lib/userPrefs';

// Puts the chosen theme color on <html> so the CSS overrides recolor the site accent.
export default function AccentApplier() {
  const { accent, glass_transparency } = useUserPrefs();
  useEffect(() => {
    // 50% = default look, 0% = heavily tinted, 100% = fully clear glass
    const mult = ((100 - glass_transparency) / 50) ** 2;
    document.documentElement.style.setProperty('--glass-mult', String(mult));
  }, [glass_transparency]);
  useEffect(() => {
    const el = document.documentElement;
    if (accent && accent !== 'cyan') el.dataset.accent = accent;
    else delete el.dataset.accent;
  }, [accent]);
  return null;
}