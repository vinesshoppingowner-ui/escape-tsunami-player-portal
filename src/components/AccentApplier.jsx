import { useEffect } from 'react';
import { useUserPrefs } from '@/lib/userPrefs';
import { resolveBackground } from '@/lib/backgrounds';
import { FONT_PAIRS, HEX_RE, accentShades } from '@/lib/themeExtras';

const FONT_SIZES = { small: '14px', normal: '16px', large: '18px' };
const toggleAttr = (el, key, on, val = '') => { if (on) el.dataset[key] = val; else delete el.dataset[key]; };

// Puts the chosen theme/display settings on <html> so the CSS overrides apply site-wide.
export default function AccentApplier() {
  const p = useUserPrefs();
  const bg = resolveBackground(p);

  useEffect(() => {
    const el = document.documentElement;
    if (bg) { el.style.setProperty('--page-bg', bg); el.dataset.bg = ''; }
    else { el.style.removeProperty('--page-bg'); delete el.dataset.bg; }
    el.style.setProperty('--bg-blur', `${p.background_blur || 0}px`);
  }, [bg, p.background_blur]);

  useEffect(() => {
    // 50% = default look, 0% = heavily tinted, 100% = fully clear glass
    const mult = ((100 - p.glass_transparency) / 50) ** 2;
    document.documentElement.style.setProperty('--glass-mult', String(mult));
  }, [p.glass_transparency]);

  useEffect(() => {
    const el = document.documentElement;
    const custom = p.accent === 'custom' && HEX_RE.test(p.accent_hex || '');
    const shades = custom ? accentShades(p.accent_hex) : null;
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((s) => {
      if (shades) el.style.setProperty(`--acc-${s}`, shades[s]);
      else el.style.removeProperty(`--acc-${s}`);
    });
    toggleAttr(el, 'accent', !custom && p.accent && p.accent !== 'cyan', p.accent);
  }, [p.accent, p.accent_hex]);

  useEffect(() => {
    const el = document.documentElement;
    const pair = FONT_PAIRS[p.font_pair] || FONT_PAIRS.default;
    el.style.setProperty('--font-heading', `${pair.heading}, ui-sans-serif, system-ui, sans-serif`);
    el.style.setProperty('--font-display', `${pair.heading}, ui-sans-serif, system-ui, sans-serif`);
    el.style.setProperty('--font-body', `${pair.body}, ui-sans-serif, system-ui, sans-serif`);
  }, [p.font_pair]);

  useEffect(() => {
    const el = document.documentElement;
    el.style.fontSize = FONT_SIZES[p.font_size] || FONT_SIZES.normal;
    toggleAttr(el, 'compact', p.compact_mode);
    toggleAttr(el, 'reduceMotion', p.reduce_motion);
    toggleAttr(el, 'contrast', p.high_contrast);
    toggleAttr(el, 'corners', p.corner_style && p.corner_style !== 'default', p.corner_style);
  }, [p.font_size, p.compact_mode, p.reduce_motion, p.high_contrast, p.corner_style]);

  return bg ? <div className="page-bg-layer" aria-hidden="true" /> : null;
}