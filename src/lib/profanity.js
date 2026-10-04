// Chat language screening for the staff Live Chat feed.
// Severity tiers: mild (rude), medium (profanity), extreme (slurs / threats).
// Roblox's own filter is the strongest signal — when it censors or rephrases a
// message we always treat it as flagged (see screenChat).

const LISTS = {
  extreme: [
    'nigger', 'nigga', 'niger', 'nig', 'faggot', 'fagot', 'fag', 'tranny', 'retard', 'retarded',
    'kys', 'kill yourself', 'killurself', 'kill urself', 'neck yourself', 'rape', 'rapist',
    'pedo', 'pedophile', 'chink', 'spic', 'kike', 'coon', 'nazi', 'hitler',
  ],
  medium: [
    'fuck', 'fuk', 'fuc', 'fck', 'fcku', 'phuck', 'wtf', 'stfu', 'shit', 'sht', 'shyt',
    'bitch', 'btch', 'biatch', 'cunt', 'whore', 'hoe', 'slut', 'dick', 'cock', 'pussy',
    'asshole', 'bastard', 'wanker', 'twat', 'cum', 'porn', 'sex', 'horny', 'balls',
  ],
  mild: [
    'crap', 'damn', 'hell', 'ass', 'arse', 'piss', 'idiot', 'stupid', 'dumb', 'moron',
    'loser', 'suck', 'noob', 'trash', 'garbage', 'shut up', 'shutup', 'shuttup', 'freak',
    'jerk', 'fat', 'fatass', 'ugly', 'cringe', 'weirdo', 'bruh',
  ],
};

// Common character substitutions used to bypass filters (l33t speak).
const SUBS = {
  '4': 'a', '@': 'a', '8': 'b', '(': 'c', '3': 'e', '6': 'g', '1': 'i', '!': 'i',
  '|': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '2': 'z',
};

function deLeet(text = '') {
  return text
    .toLowerCase()
    .split('')
    .map((c) => SUBS[c] ?? c)
    .join('');
}

// Spaced-out text: "f u c k" / "s-h-i-t" → "fuck" / "shit"
function collapse(text = '') {
  return deLeet(text)
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1{2,}/g, '$1$1'); // "fuuuuck" → "fuuck"
}

function normalize(text = '') {
  return deLeet(text)
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SEVERITY_ORDER = ['mild', 'medium', 'extreme'];

/**
 * Screens a chat message for inappropriate language, catching common bypasses
 * (l33t speak, spaced letters, repeated characters, words inside other words).
 * Returns { severity: 'mild'|'medium'|'extreme'|null, matches: string[] }
 */
export function screenMessage(message) {
  if (!message) return { severity: null, matches: [] };
  const words = normalize(message);
  const squished = collapse(message);
  const matches = [];
  let severity = null;

  for (const tier of SEVERITY_ORDER) {
    for (const word of LISTS[tier]) {
      const key = word.replace(/\s/g, '');
      const hit = key.length <= 3
        ? ` ${words} `.includes(` ${word} `)
        : squished.includes(key) || words.includes(word);
      if (hit) {
        matches.push(word);
        severity = tier; // later tiers override — extreme wins
      }
    }
  }

  return { severity, matches: [...new Set(matches)] };
}

/**
 * Screens a whole ChatLog record. Roblox's filter takes priority: if Roblox
 * censored or rephrased the message, it's flagged regardless of our word lists.
 * Returns { severity, matches, robloxFlagged, filtered }
 */
export function screenChat(record = {}) {
  const { severity, matches } = screenMessage(record.message);
  const filtered = record.filtered_message || '';
  const robloxFlagged = !!record.roblox_flagged || (!!filtered && filtered !== record.message);
  return {
    severity: robloxFlagged ? severity || 'medium' : severity,
    matches,
    robloxFlagged,
    filtered: robloxFlagged ? filtered : '',
  };
}

/**
 * Censors profanity in a message by replacing matched words (and common
 * l33t-speak variants) with asterisks. Keeps the first letter visible.
 */
export function censorMessage(message) {
  if (!message) return message;
  const { matches } = screenMessage(message);
  if (!matches.length) return message;
  const leetMap = {
    a: 'a4@', e: 'e3', i: 'i1!|', o: 'o0', s: 's5$', t: 't7+',
    b: 'b8', c: 'c(]', g: 'g6', z: 'z2', u: 'u',
  };
  let result = message;
  for (const word of matches) {
    const pattern = word.split('').map((c) => {
      const sub = leetMap[c];
      if (!sub) return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return `[${sub.replace(']', '\\]')}]`;
    }).join('');
    try {
      const regex = new RegExp(pattern, 'gi');
      result = result.replace(regex, (match) => match[0] + '*'.repeat(Math.max(match.length - 1, 1)));
    } catch {}
  }
  return result;
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