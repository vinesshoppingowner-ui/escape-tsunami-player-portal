// Every Discord permission flag (bit index → label)
export const PERMISSIONS = [
  [0, 'Create Invite'], [1, 'Kick Members'], [2, 'Ban Members'], [3, 'Administrator'],
  [4, 'Manage Channels'], [5, 'Manage Server'], [6, 'Add Reactions'], [7, 'View Audit Log'],
  [8, 'Priority Speaker'], [9, 'Video / Stream'], [10, 'View Channels'], [11, 'Send Messages'],
  [12, 'Send TTS Messages'], [13, 'Manage Messages'], [14, 'Embed Links'], [15, 'Attach Files'],
  [16, 'Read Message History'], [17, 'Mention Everyone'], [18, 'Use External Emojis'], [19, 'View Server Insights'],
  [20, 'Connect (Voice)'], [21, 'Speak'], [22, 'Mute Members'], [23, 'Deafen Members'],
  [24, 'Move Members'], [25, 'Use Voice Activity'], [26, 'Change Nickname'], [27, 'Manage Nicknames'],
  [28, 'Manage Roles'], [29, 'Manage Webhooks'], [30, 'Manage Emojis & Stickers'], [31, 'Use Application Commands'],
  [32, 'Request to Speak'], [33, 'Manage Events'], [34, 'Manage Threads'], [35, 'Create Public Threads'],
  [36, 'Create Private Threads'], [37, 'Use External Stickers'], [38, 'Send Messages in Threads'], [39, 'Use Activities'],
  [40, 'Timeout Members'], [41, 'View Creator Monetization'], [42, 'Use Soundboard'], [43, 'Create Expressions'],
  [44, 'Create Events'], [45, 'Use External Sounds'], [46, 'Send Voice Messages'], [49, 'Send Polls'],
  [50, 'Use External Apps'],
];

export const hasPerm = (perms, bit) => (BigInt(perms || 0) & (1n << BigInt(bit))) !== 0n;
export const togglePerm = (perms, bit) => (BigInt(perms || 0) ^ (1n << BigInt(bit))).toString();