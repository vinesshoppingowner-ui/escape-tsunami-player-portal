export const GAME_URL = 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers';
export const GROUP_URL = 'https://www.roblox.com/communities/33513762';
export const DISCORD_URL = 'https://discord.gg/NCBqfpwPuT';
export const GAME_ICON = 'https://tr.rbxcdn.com/180DAY-acc19bee7d79dc93900a4b042adad2e3/256/256/Image/Png/noFilter';
export const GAME_NAME = 'Escape Tsunami For Developers';

export const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
};