const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del',
  'span', 'p', 'div', 'br', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'blockquote', 'a', 'hr', 'font', 'mark', 'code'
]);

const ALLOWED_STYLES = new Set([
  'color', 'background-color', 'background', 'text-align', 'font-size', 'font-weight', 'text-decoration'
]);

export function isRichHtml(str = '') {
  return /<\/?[a-z][\s\S]*>/i.test(String(str));
}

export function toEditableHtml(value = '') {
  const raw = String(value || '');
  if (!raw.trim()) return '';
  if (isRichHtml(raw)) return sanitizeRichHtml(raw);
  return raw
    .split('\n')
    .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
    .join('');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sanitizeRichHtml(input = '') {
  const raw = String(input || '');
  if (!raw.trim()) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return raw;
  }

  const doc = new DOMParser().parseFromString(raw, 'text/html');

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createDocumentFragment();
    }

    const tag = node.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object') {
      return document.createDocumentFragment();
    }

    let outEl;
    if (tag === 'font') {
      outEl = document.createElement('span');
      const color = node.getAttribute('color');
      if (color) outEl.style.color = color;
    } else if (ALLOWED_TAGS.has(tag)) {
      outEl = document.createElement(tag);
    } else {
      outEl = document.createElement('span');
    }

    const styleAttr = node.getAttribute('style');
    if (styleAttr) {
      const safeRules = [];
      styleAttr.split(';').forEach((decl) => {
        const [prop, val] = decl.split(':').map((s) => s?.trim());
        if (!prop || !val) return;
        const lowerProp = prop.toLowerCase();
        const lowerVal = val.toLowerCase();
        if (
          ALLOWED_STYLES.has(lowerProp) &&
          !lowerVal.includes('url(') &&
          !lowerVal.includes('expression') &&
          !lowerVal.includes('javascript:')
        ) {
          safeRules.push(`${lowerProp}: ${val}`);
        }
      });
      if (safeRules.length) {
        outEl.setAttribute('style', safeRules.join('; '));
      }
    }

    if (tag === 'a') {
      const href = (node.getAttribute('href') || '').trim();
      if (/^(https?:\/\/|mailto:|\/)/i.test(href)) {
        outEl.setAttribute('href', href);
        outEl.setAttribute('target', '_blank');
        outEl.setAttribute('rel', 'noopener noreferrer');
      }
    }

    Array.from(node.childNodes).forEach((child) => {
      outEl.appendChild(cleanNode(child));
    });

    return outEl;
  };

  const container = document.createElement('div');
  Array.from(doc.body.childNodes).forEach((n) => {
    container.appendChild(cleanNode(n));
  });
  return container.innerHTML;
}

export function stripRichText(input = '') {
  const raw = String(input || '');
  if (!raw.trim()) return '';
  if (!isRichHtml(raw)) return raw;
  return raw
    .replace(/<li[^>]*>/gi, ' • ')
    .replace(/<\/(p|div|h1|h2|h3|h4|li|blockquote|br)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}