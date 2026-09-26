// Page background presets. Values are CSS `background` strings.
export const BACKGROUNDS = [
  { value: 'default', label: 'Default', css: '#0B0D13' },
  { value: 'midnight', label: 'Midnight', css: 'radial-gradient(ellipse at top, #1e293b 0%, #0B0D13 60%)' },
  { value: 'abyss', label: 'Abyss', css: 'linear-gradient(180deg, #06283a 0%, #0B0D13 70%)' },
  { value: 'aurora', label: 'Aurora', css: 'radial-gradient(circle at 15% 10%, rgba(16,185,129,0.25), transparent 45%), radial-gradient(circle at 85% 25%, rgba(139,92,246,0.25), transparent 45%), #0B0D13' },
  { value: 'ember', label: 'Ember', css: 'radial-gradient(circle at 50% 0%, rgba(244,63,94,0.25), transparent 55%), #0f0a0d' },
  { value: 'royal', label: 'Royal', css: 'linear-gradient(135deg, #1e1b4b 0%, #0B0D13 60%)' },
  { value: 'storm', label: 'Storm', css: 'linear-gradient(160deg, #1f2937 0%, #0B0D13 55%, #111827 100%)' },
];

// Resolves the user's background prefs to a CSS background, or null for the default look.
export function resolveBackground({ background, background_color, background_color2, background_image, background_dim = 65 }) {
  if (background === 'custom_image' && background_image) {
    const a = background_dim / 100;
    return `linear-gradient(rgba(11,13,19,${a}), rgba(11,13,19,${a})), url("${background_image}")`;
  }
  if (background === 'custom_color' && background_color) {
    return background_color2 ? `linear-gradient(135deg, ${background_color}, ${background_color2})` : background_color;
  }
  const preset = BACKGROUNDS.find((b) => b.value === background);
  return preset && preset.value !== 'default' ? preset.css : null;
}