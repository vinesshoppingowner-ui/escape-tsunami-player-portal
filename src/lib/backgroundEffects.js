import createRain from '@/lib/fx/rain';
import createSnow from '@/lib/fx/snow';
import createFlutter from '@/lib/fx/flutter';
import createSummer from '@/lib/fx/summer';
import createStars from '@/lib/fx/stars';
import createBubbles from '@/lib/fx/bubbles';

import { isOwner } from '@/lib/isOwner';

export const canUseBgEffects = (user) => isOwner(user);

export const BG_EFFECTS = {
  none: { label: 'None', icon: '🚫' },
  rain: { label: 'Thunderstorm', icon: '⛈️', create: createRain },
  snow: { label: 'Snowfall', icon: '❄️', create: createSnow },
  leaves: { label: 'Fall Leaves', icon: '🍂', create: () => createFlutter('leaves') },
  blossoms: { label: 'Spring Petals', icon: '🌸', create: () => createFlutter('petals') },
  summer: { label: 'Golden Summer', icon: '🌅', create: createSummer },
  stars: { label: 'Galaxy', icon: '🌌', create: createStars },
  bubbles: { label: 'Deep Ocean', icon: '🫧', create: createBubbles },
};