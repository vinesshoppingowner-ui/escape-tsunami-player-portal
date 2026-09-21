// Chat language screening for the staff Live Chat feed.
// Severity tiers: mild (rude), medium (profanity), extreme (slurs / threats / bypass-worthy).

const LISTS = {
  extreme: [
    'nigger', 'nigga', 'niger', 'faggot', 'fagot', 'fag', 'tranny', 'retard', 'retarded',
    'kys', 'kill yourself', 'killurself', 'kill urself', 'neck yourself', 'rape', 'rapist',
    'pedo', 'pedophile', 'chink', 'spic', 'kike', 'coon', 'nazi', 'hitler',
  ],
  medium: [
    'fuck', 'fucking', 'fucker', 'fuk', 'fck', 'motherfucker', 'shit', 'shitty', 'bullshit',
    'bitch', 'bitches', 'cunt', 'whore', 'slut', 'dick', 'cock', 'pussy', 'asshole',
    'bastard', 'wanker', 'twat', 'dickhead', 'jerkoff', 'cum', 'porn', 'sex', 'horny',
  ],
  mild: [
    'crap', 'damn', 'damnit', 'hell', 'ass', 'arse', 'piss', 'pissed', 'idiot', 'stupid',
    'dumb', 'dumbass', 'moron', 'loser', 'suck', 'sucks', 'noob', 'trash', 'garbage',
    'shut up', 'shutup', 'freak', 'jerk',
  ],
};

// Common character substitutions used to bypass filters (l33t speak).
const SUBS = {
  '4': 'a', '@': 'a', '8': 'b', '(': 'c', '3': 'e', '6': 'g', '1': 'i', '!': 'i',
  '|': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '2': 'z',
};

function normalize(text = '') {
  return text
    .toLowerCase()
    .split('')
    .map((c) => SUBS[c] ?? c)
    .join('')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SEVERITY_ORDER = ['mild', 'medium', 'extreme'];

/**
 * Screens a chat message for inappropriate language.
 * Returns { severity: 'mild'|'medium'|'extreme'|null, matches: string[] }
 */
export function screenMessage(message) {
  if (!message) return { severity: null, matches: [] };
  const clean = normalize(message);
  const padded = ` ${clean} `;
  const matches = [];
  let severity = null;

  for (const tier of SEVERITY_ORDER) {
    for (const word of LISTS[tier]) {
      const hit = word.includes(' ')
        ? padded.includes(` ${word} `) || clean.includes(word)
        : padded.includes(` ${word} `);
      if (hit) {
        matches.push(word);
        severity = tier; // later tiers override — extreme wins
      }
    }
  }

  return { severity, matches: [...new Set(matches)] };
}

export const SEVERITY_STYLES = {
  mild: {
    label: 'Mild',
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    row: 'bg-yellow-500/[0.04] border-l-2 border-l-yellow-500/50',
    dot: 'bg-yellow-400',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    row: 'bg-orange-500/[0.05] border-l-2 border-l-orange-500/60',
    dot: 'bg-orange-400',
  },
  extreme: {
    label: 'Extreme',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    row: 'bg-rose-500/[0.07] border-l-2 border-l-rose-500/70',
    dot: 'bg-rose-400',
  },
};