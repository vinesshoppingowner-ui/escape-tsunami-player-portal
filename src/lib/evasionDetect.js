function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

const stripName = (u) => u.toLowerCase().replace(/[^a-z]/g, '');

// Compares every banned player against every other known account.
export function detectEvasion({ moderations, users, streaks }) {
  const banned = [...new Set(moderations.filter((m) => m.status === 'Active' && m.moderation_type?.includes('Ban')).map((m) => m.roblox_username).filter(Boolean))];
  const bannedSet = new Set(banned.map((b) => b.toLowerCase()));
  const discordOf = {};
  streaks.forEach((s) => { if (s.discord_id && s.roblox_username) discordOf[s.roblox_username.toLowerCase()] = s.discord_id; });

  const candidates = [...new Set([
    ...users.map((u) => u.roblox_username),
    ...streaks.map((s) => s.roblox_username),
    ...moderations.map((m) => m.roblox_username),
  ].filter(Boolean))].filter((c) => !bannedSet.has(c.toLowerCase()));

  const flags = [];
  for (const b of banned) {
    for (const c of candidates) {
      const reasons = [];
      const bl = b.toLowerCase(), cl = c.toLowerCase();
      if (discordOf[bl] && discordOf[bl] === discordOf[cl]) reasons.push({ text: 'Same Discord account', weight: 3 });
      if (stripName(b).length >= 4 && stripName(b) === stripName(c)) reasons.push({ text: 'Same name, different numbers/symbols', weight: 2 });
      else if (Math.min(b.length, c.length) >= 5 && levenshtein(bl, cl) <= 2) reasons.push({ text: 'Very similar username', weight: 1 });
      if (reasons.length) flags.push({ banned: b, suspect: c, reasons, score: reasons.reduce((s, r) => s + r.weight, 0) });
    }
  }
  return flags.sort((x, y) => y.score - x.score);
}