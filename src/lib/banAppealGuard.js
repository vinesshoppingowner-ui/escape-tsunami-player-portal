import { base44 } from '@/api/base44Client';
import { UNLISTED_ID } from '@/lib/unlistedAppeal';
import { screenMessage } from '@/lib/profanity';

export const WEBSITE_BAN_TYPE = 'Website Ban';
export const MAX_WEBSITE_APPEALS = 2;

export const isWebsiteBanAppeal = (a) => a?.moderation_id === UNLISTED_ID && a?.unlisted_type === WEBSITE_BAN_TYPE;

export const countWebsiteAppeals = (username) =>
  base44.entities.Appeal.count({ roblox_username: username, moderation_id: UNLISTED_ID, unlisted_type: WEBSITE_BAN_TYPE });

// Returns an error string when the appeal looks like spam or AI-written, else null.
export async function checkBanAppeal(text) {
  const t = text.trim();
  const words = t.split(/\s+/);
  if (words.length < 5) return 'Please write at least a full sentence explaining what happened.';
  if (/(.)\1{5,}/.test(t) || new Set(words.map((w) => w.toLowerCase())).size < words.length / 3) {
    return 'Your report looks like spam. Please explain in your own words.';
  }
  if (screenMessage(t).severity) return 'Please keep your report respectful.';
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You screen ban appeals from Roblox players (often kids/teens) on a game website. Decide if this appeal is spam (gibberish, copy-pasted filler, off-topic, trolling) or clearly AI-generated (e.g. ChatGPT-style formal essay, "I sincerely apologize for any inconvenience", generic templated structure). Be lenient with casual, short, misspelled genuine messages.\n\nAppeal:\n"""${t}"""`,
    response_json_schema: { type: 'object', properties: { spam: { type: 'boolean' }, ai_generated: { type: 'boolean' } } },
  });
  if (res?.spam) return 'Your report looks like spam. Please explain what happened honestly.';
  if (res?.ai_generated) return 'Please write your report yourself — AI-written appeals are not accepted.';
  return null;
}