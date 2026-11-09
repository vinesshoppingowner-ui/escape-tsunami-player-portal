export const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', icon: 'Type', group: 'Text' },
  { value: 'textarea', label: 'Long Text', icon: 'AlignLeft', group: 'Text' },
  { value: 'screenshot', label: 'Screenshot / File Upload (Any Size)', icon: 'ImagePlus', group: 'Uploads & Media', isNew: true },
  { value: 'file', label: 'Document / File Upload', icon: 'Paperclip', group: 'Uploads & Media' },
  { value: 'youtube', label: 'YouTube Video', icon: 'Youtube', group: 'Uploads & Media' },
  { value: 'code', label: 'Code Snippet', icon: 'Code', group: 'Text' },
  { value: 'dropdown', label: 'Dropdown', icon: 'ChevronDown', group: 'Choices' },
  { value: 'radio', label: 'Multiple Choice', icon: 'Circle', group: 'Choices' },
  { value: 'checkbox', label: 'Checkboxes', icon: 'CheckSquare', group: 'Choices' },
  { value: 'yesno', label: 'Yes / No', icon: 'ToggleLeft', group: 'Choices' },
  { value: 'age_range', label: 'Age Bracket Selector', icon: 'UserCheck', group: 'Choices', isNew: true },
  { value: 'scale', label: 'Linear Scale (1–10)', icon: 'Sliders', group: 'Ratings & Scales' },
  { value: 'slider', label: 'Interactive Slider / Hours', icon: 'Gauge', group: 'Ratings & Scales', isNew: true },
  { value: 'rating', label: 'Star Rating (1–5)', icon: 'Star', group: 'Ratings & Scales' },
  { value: 'discord', label: 'Discord Username / ID', icon: 'MessageSquare', group: 'Player & Contact' },
  { value: 'roblox', label: 'Roblox Username', icon: 'Gamepad2', group: 'Player & Contact' },
  { value: 'timezone', label: 'Timezone Selector', icon: 'Globe', group: 'Player & Contact', isNew: true },
  { value: 'availability', label: 'Weekly Availability Schedule', icon: 'CalendarClock', group: 'Player & Contact', isNew: true },
  { value: 'email', label: 'Email', icon: 'Mail', group: 'Player & Contact' },
  { value: 'url', label: 'Website / Portfolio URL', icon: 'Link', group: 'Player & Contact' },
  { value: 'number', label: 'Number', icon: 'Hash', group: 'Other' },
  { value: 'date', label: 'Date', icon: 'Calendar', group: 'Other' },
  { value: 'section', label: 'Section Header / Info', icon: 'LayoutList', group: 'Layout' },
];

export const AGE_BRACKETS = ['Under 13', '13–15', '16–17', '18–20', '21+'];

export const COMMON_TIMEZONES = [
  'UTC / GMT (Coordinated Universal Time)',
  'EST / EDT (US Eastern — UTC-5/-4)',
  'CST / CDT (US Central — UTC-6/-5)',
  'MST / MDT (US Mountain — UTC-7/-6)',
  'PST / PDT (US Pacific — UTC-8/-7)',
  'BST / GMT (UK — UTC+0/+1)',
  'CET / CEST (Central Europe — UTC+1/+2)',
  'EET / EEST (Eastern Europe — UTC+2/+3)',
  'IST (India — UTC+5:30)',
  'SGT / PHT (Southeast Asia — UTC+8)',
  'JST / KST (Japan / Korea — UTC+9)',
  'AEST / AEDT (Australia East — UTC+10/+11)',
  'NZST / NZDT (New Zealand — UTC+12/+13)',
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function extractYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export const defaultQuestion = () => ({
  id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
  text: '',
  description: '',
  type: 'text',
  required: false,
  options: [],
  placeholder: '',
  maxLength: 0,
  showIf: null,
  validation: null,
  fileTypes: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4'],
  maxFileSize: 0, // 0 = unlimited for screenshots
  allowMultipleFiles: true,
  youtubeUrl: '',
  scaleMax: 10,
  scaleMinLabel: 'Beginner',
  scaleMaxLabel: 'Expert',
  sliderMin: 0,
  sliderMax: 40,
  sliderStep: 1,
  sliderUnit: 'hrs/wk',
});

export const defaultSettings = () => ({
  requireRobloxVerification: false,
  oneResponsePerUser: true,
  responseLimit: 0,
  allowEditing: false,
  collectEmail: true,
  sendCopy: false,
  shuffleQuestions: false,
  showSubmitAnother: false,
  showResultsSummary: false,
  disableAutosave: false,
  showProgressBar: true,
  singlePageMode: false,
  timeLimitMinutes: 0,
  customTermsText: '',
  allowRetake: false,
  retakeCooldownDays: 7,
  maxAttempts: 3,
  aiReviewEnabled: false,
  aiCriteria: '',
  restrictToUsers: false,
  allowedUsers: [],
  discordAlert: true,
  blockCopyPaste: true,
  promotePopover: false,
  promoteMessage: '',
  promoteFrequency: 'always',
});

export const RESPONSE_TAGS = ['Strong', 'Promising', 'Needs interview', 'Low effort', 'Suspicious', 'Duplicate'];

export const FEEDBACK_TEMPLATES = [
  { label: 'Welcome aboard', status: 'accepted', text: 'Great answers — welcome aboard! Staff will reach out with next steps.' },
  { label: 'Interview next', status: 'under_review', text: 'Your application stood out. We would like to schedule a short interview.' },
  { label: 'More detail', status: 'rejected', text: 'Thanks for applying. Please give more detailed answers next time.' },
  { label: 'Not a fit', status: 'rejected', text: 'Thanks for applying. We have decided not to move forward at this time.' },
];

export const RESPONSE_STATUS = {
  submitted: { label: 'Submitted', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  under_review: { label: 'Under Review', cls: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Rejected', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export const formatAnswer = (q, a) => {
  if (q?.type === 'section') return '';
  if (a === undefined || a === null || a === '' || (Array.isArray(a) && !a.length)) return '';
  if (Array.isArray(a)) return a.join(', ');
  if (q?.type === 'rating') return `${a} / 5`;
  if (q?.type === 'scale') return `${a} / ${q.scaleMax || 10}`;
  if (q?.type === 'slider') return `${a} ${q.sliderUnit || ''}`.trim();
  if (q?.type === 'yesno') return a ? 'Yes' : 'No';
  if ((q?.type === 'file' || q?.type === 'screenshot') && typeof a === 'string' && a.startsWith('file:')) {
    const items = a.split('\n').filter((line) => line.startsWith('file:'));
    return items.map((item) => item.split('|')[1] || 'Uploaded file').join(', ');
  }
  return String(a);
};