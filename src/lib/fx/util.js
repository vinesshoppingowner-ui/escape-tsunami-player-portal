export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const TAU = Math.PI * 2;

// Scales particle counts to the screen size so small screens stay smooth
export const scaleCount = (base, w, h) => Math.max(8, Math.round(base * Math.min(2, (w * h) / (1440 * 900))));

// Pre-rendered soft glowing dot, drawn with drawImage for performance
export function glowSprite(rgb, size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(0.2, `rgba(${rgb},0.8)`);
  gr.addColorStop(0.45, `rgba(${rgb},0.25)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return c;
}