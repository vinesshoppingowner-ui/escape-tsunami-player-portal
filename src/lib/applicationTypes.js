export const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', icon: 'Type' },
  { value: 'textarea', label: 'Long Text', icon: 'AlignLeft' },
  { value: 'dropdown', label: 'Dropdown', icon: 'ChevronDown' },
  { value: 'radio', label: 'Multiple Choice', icon: 'Circle' },
  { value: 'checkbox', label: 'Checkboxes', icon: 'CheckSquare' },
  { value: 'number', label: 'Number', icon: 'Hash' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'date', label: 'Date', icon: 'Calendar' },
  { value: 'rating', label: 'Rating', icon: 'Star' },
  { value: 'yesno', label: 'Yes / No', icon: 'ToggleLeft' },
];

export const defaultQuestion = () => ({
  id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
  text: '',
  description: '',
  type: 'text',
  required: false,
  options: [],
  placeholder: '',
  maxLength: 0,
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
  allowRetake: false,
  retakeCooldownDays: 7,
  maxAttempts: 3,
  aiReviewEnabled: false,
  aiCriteria: '',
  restrictToUsers: false,
  allowedUsers: [],
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
  if (a === undefined || a === null || a === '' || (Array.isArray(a) && !a.length)) return '';
  if (Array.isArray(a)) return a.join(', ');
  if (q.type === 'rating') return `${a} / 5`;
  if (q.type === 'yesno') return a ? 'Yes' : 'No';
  return String(a);
};