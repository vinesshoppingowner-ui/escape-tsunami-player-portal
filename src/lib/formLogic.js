// Conditional logic evaluator and field validation for application forms.

/**
 * Evaluates a showIf rule against current answers.
 * showIf shape: { questionId, operator, value }
 *   or: { logic: 'and'|'or', conditions: [{ questionId, operator, value }] }
 * Returns true if the question should be visible.
 */
export function evalShowIf(question, answers) {
  const rule = question.showIf;
  if (!rule) return true;

  // Single condition
  if (rule.questionId) return evalCondition(rule, answers);

  // Multiple conditions
  if (rule.conditions && Array.isArray(rule.conditions)) {
    const results = rule.conditions.map((c) => evalCondition(c, answers));
    return rule.logic === 'or' ? results.some(Boolean) : results.every(Boolean);
  }

  return true;
}

function evalCondition(cond, answers) {
  const actual = answers[cond.questionId];
  const expected = cond.value;
  switch (cond.operator) {
    case 'equals': return actual === expected;
    case 'notEquals': return actual !== expected;
    case 'contains': return Array.isArray(actual) ? actual.includes(expected) : String(actual || '').includes(expected);
    case 'notContains': return Array.isArray(actual) ? !actual.includes(expected) : !String(actual || '').includes(expected);
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'notIn': return Array.isArray(expected) && !expected.includes(actual);
    case 'gt': return Number(actual) > Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'filled': return actual !== undefined && actual !== null && actual !== '' && !(Array.isArray(actual) && actual.length === 0);
    case 'empty': return actual === undefined || actual === null || actual === '' || (Array.isArray(actual) && actual.length === 0);
    default: return true;
  }
}

const isEmpty = (a) => a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0);

/**
 * Validates a single field. Returns an error string or empty string if valid.
 */
export function validateField(q, value) {
  if (q.required && isEmpty(value)) return 'This question is required.';

  if (isEmpty(value)) return ''; // optional and empty = valid

  const v = q.validation || {};
  const str = String(value);

  // Min/max length for text-based fields
  if (['text', 'textarea'].includes(q.type)) {
    if (v.minLength && str.length < v.minLength)
      return `Must be at least ${v.minLength} characters (currently ${str.length}).`;
    if (v.maxLength && str.length > v.maxLength)
      return `Must be at most ${v.maxLength} characters (currently ${str.length}).`;
  }

  // Regex pattern
  if (v.pattern) {
    try {
      const re = new RegExp(v.pattern);
      if (!re.test(str)) return v.patternMessage || 'Invalid format.';
    } catch { /* invalid regex — skip */ }
  }

  // Number bounds
  if (q.type === 'number' && value !== '') {
    const n = Number(value);
    if (v.min !== undefined && n < v.min) return `Must be ${v.min} or higher.`;
    if (v.max !== undefined && n > v.max) return `Must be ${v.max} or lower.`;
  }

  // Email
  if (q.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Please enter a valid email address.';

  // YouTube URL validation when the question asks the applicant to provide a YouTube link
  if (q.type === 'youtube' && !q.youtubeUrl) {
    const ytMatch = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(str) || /^[a-zA-Z0-9_-]{11}$/.test(str.trim());
    if (!ytMatch) return 'Please enter a valid YouTube video URL.';
  }

  // File
  if (q.type === 'file' && typeof value === 'string' && value.startsWith('file:')) {
    // file_uri stored as answer — valid
  }

  return '';
}

/**
 * Reads URL query params and returns a pre-fill answers object.
 * Format: ?q_questionId=value or ?prefill_questionId=value
 */
export function readPrefillParams(questions) {
  const params = new URLSearchParams(window.location.search);
  const answers = {};
  for (const q of questions) {
    const val = params.get(`q_${q.id}`) || params.get(`prefill_${q.id}`);
    if (val !== null) {
      if (q.type === 'number') answers[q.id] = Number(val);
      else if (q.type === 'yesno') answers[q.id] = val === 'true' || val === 'yes';
      else answers[q.id] = val;
    }
  }
  return answers;
}