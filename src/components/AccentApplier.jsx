import { useEffect } from 'react';
import { useUserPrefs } from '@/lib/userPrefs';
import { resolveBackground } from '@/lib/backgrounds';

const FONT_SIZES = { small: '14px', normal: '16px', large: '18px' };

// Puts the chosen theme/display settings on <html> so the CSS overrides apply site-wide.
export default function AccentApplier() {
  const { accent, glass_transparency, font_size, compact_mode, reduce_motion, background, background_color, background_color2, background_image } = useUserPrefs();
  useEffect(() => {
    const el = document.documentElement;
    const bg = resolveBackground({ background, background_color, background_color2, background_image });
    if (bg) { el.style.setProperty('--page-bg', bg); el.dataset.bg = ''; }
    else { el.style.removeProperty('--page-bg'); delete el.dataset.bg; }
  }, [background, background_color, background_color2, background_image]);
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
  useEffect(() => {
    const el = document.documentElement;
    el.style.fontSize = FONT_SIZES[font_size] || FONT_SIZES.normal;
    if (compact_mode) el.dataset.compact = ''; else delete el.dataset.compact;
    if (reduce_motion) el.dataset.reduceMotion = ''; else delete el.dataset.reduceMotion;
  }, [font_size, compact_mode, reduce_motion]);
  return null;
}