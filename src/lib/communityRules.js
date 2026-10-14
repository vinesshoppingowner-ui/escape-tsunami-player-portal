/**
 * Community Rules Mapping
 * Maps moderation reason keywords to community rules section URLs.
 * Used to show educational rule links on moderation cards.
 *
 * Update the URLs below to point to your actual rules sections.
 * The Discord server is the canonical rules location:
 * https://discord.gg/NCBqfpwPuT
 */

const RULES_BASE = 'https://discord.gg/NCBqfpwPuT';

const RULE_KEYWORDS = [
  { keywords: ['exploit', 'exploiting', 'hack', 'hacking', 'cheat', 'cheating', 'executor', 'injector'], url: RULES_BASE, section: 'Exploiting & Cheating' },
  { keywords: ['bug', 'glitch', 'abuse', 'bug abuse', 'glitching'], url: RULES_BASE, section: 'Bug Abuse' },
  { keywords: ['toxic', 'toxicity', 'harassment', 'harass', 'bully', 'bullying'], url: RULES_BASE, section: 'Harassment & Toxicity' },
  { keywords: ['swear', 'profanity', 'curs', 'curse', 'bad language', 'inappropriate language'], url: RULES_BASE, section: 'Inappropriate Language' },
  { keywords: ['spam', 'spamming', 'flood', 'flooding'], url: RULES_BASE, section: 'Spam & Flooding' },
  { keywords: ['scam', 'scamming', 'scammer', 'fraud'], url: RULES_BASE, section: 'Scamming' },
  { keywords: ['exploit', 'fly', 'noclip', 'speed', 'teleport', 'god mode'], url: RULES_BASE, section: 'Exploit Detection' },
  { keywords: ['ddos', 'doxx', 'dox', 'threat', 'threatening'], url: RULES_BASE, section: 'Threats & Doxxing' },
  { keywords: ['hate', 'hate speech', 'discriminat', 'racist', 'racism', 'homophob', 'slur'], url: RULES_BASE, section: 'Hate Speech' },
  { keywords: ['nsfw', '18+', 'inappropriate content', 'explicit'], url: RULES_BASE, section: 'NSFW Content' },
  { keywords: ['alt', 'alt account', 'ban evasion', 'evading', 'evade'], url: RULES_BASE, section: 'Ban Evasion' },
  { keywords: ['impersonat', 'impersonating', 'pretending'], url: RULES_BASE, section: 'Impersonation' },
  { keywords: ['staff', 'disrespect', 'disrespecting staff', 'arguing'], url: RULES_BASE, section: 'Staff Disrespect' },
  { keywords: ['teamkill', 'team kill', 'grief', 'griefing', 'sabotage'], url: RULES_BASE, section: 'Griefing & Team Killing' },
  { keywords: ['encourage', 'encouraging', 'promote', 'promoting'], url: RULES_BASE, section: 'Encouraging Rule Breaking' },
  { keywords: ['ad', 'advertising', 'promo', 'promoting'], url: RULES_BASE, section: 'Advertising' },
  { keywords: ['bypass', 'bypassing', 'filter bypass'], url: RULES_BASE, section: 'Filter Bypass' },
  { keywords: ['exploit', 'macro', 'autoclicker', 'auto clicker', 'afk farm'], url: RULES_BASE, section: 'Unfair Advantages' },
];

/**
 * Match a moderation reason against the community rules mapping.
 * Returns { url, section } when a keyword match is found, or null.
 */
export function matchRule(reason) {
  if (!reason || typeof reason !== 'string') return null;
  const lower = reason.toLowerCase();
  for (const rule of RULE_KEYWORDS) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { url: rule.url, section: rule.section };
    }
  }
  return null;
}

export const COMMUNITY_RULES_URL = RULES_BASE;