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
  showProgressBar: true,
});