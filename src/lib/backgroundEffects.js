export const EFFECT_OWNER_EMAIL = 'vinesshoppingowner@gmail.com';
export const canUseBgEffects = (user) => user?.email?.toLowerCase() === EFFECT_OWNER_EMAIL;

// anim: fall (top → bottom), rise (bottom → top), twinkle (stays put), float (drifts in place)
export const BG_EFFECTS = {
  none: { label: 'None', icon: '🚫' },
  rain: { label: 'Rain', icon: '🌧️', count: 90, anim: 'fall', dur: [0.5, 1.1], size: [14, 26], drift: [-60, -30], spin: 0, cls: 'fx-rain' },
  snow: { label: 'Snow', icon: '❄️', count: 70, anim: 'fall', dur: [8, 16], size: [3, 7], drift: [-60, 60], spin: 0, cls: 'fx-snow' },
  leaves: { label: 'Fall Leaves', icon: '🍂', count: 22, anim: 'fall', dur: [10, 18], size: [16, 26], drift: [-160, 160], spin: 540, chars: ['🍂', '🍁', '🍂'] },
  blossoms: { label: 'Spring Petals', icon: '🌸', count: 26, anim: 'fall', dur: [10, 18], size: [12, 20], drift: [-140, 140], spin: 360, chars: ['🌸', '💮'] },
  summer: { label: 'Summer Fireflies', icon: '✨', count: 40, anim: 'float', dur: [4, 9], size: [3, 6], drift: [-50, 50], cls: 'fx-firefly' },
  stars: { label: 'Starry Night', icon: '🌌', count: 110, anim: 'twinkle', dur: [2, 6], size: [1, 3], cls: 'fx-star' },
  bubbles: { label: 'Bubbles', icon: '🫧', count: 30, anim: 'rise', dur: [9, 18], size: [8, 26], drift: [-40, 40], cls: 'fx-bubble' },
};

const rand = (min, max) => min + Math.random() * (max - min);

export function makeParticles(fx) {
  return Array.from({ length: fx.count }, (_, i) => ({
    id: i,
    left: rand(0, 100),
    top: rand(0, 100),
    size: rand(fx.size[0], fx.size[1]),
    dur: rand(fx.dur[0], fx.dur[1]),
    delay: -rand(0, fx.dur[1]),
    drift: fx.drift ? rand(fx.drift[0], fx.drift[1]) : 0,
    spin: fx.spin ? rand(-fx.spin, fx.spin) : 0,
    char: fx.chars ? fx.chars[i % fx.chars.length] : null,
  }));
}