// Font pairings, custom accent shade generation and other theme helpers.
export const FONT_PAIRS = {
  default: { label: 'Outfit', heading: "'Outfit'", body: "'Inter'" },
  grotesk: { label: 'Grotesk', heading: "'Space Grotesk'", body: "'Inter'" },
  rajdhani: { label: 'Rajdhani', heading: "'Rajdhani'", body: "'Inter'" },
  poppins: { label: 'Poppins', heading: "'Poppins'", body: "'Poppins'" },
};

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const SHADES = { 50: 0.95, 100: 0.9, 200: 0.75, 300: 0.55, 400: 0.3, 500: 0, 600: -0.15, 700: -0.3, 800: -0.45, 900: -0.55, 950: -0.7 };

// Builds the 50–950 accent channel values ("r g b") from one hex color.
export function accentShades(hex) {
  const base = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return Object.fromEntries(Object.entries(SHADES).map(([shade, t]) => {
    const target = t > 0 ? 255 : 0;
    const amt = Math.abs(t);
    return [shade, base.map((c) => Math.round(c + (target - c) * amt)).join(' ')];
  }));
}