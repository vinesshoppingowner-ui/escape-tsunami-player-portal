// Client-side anti-evasion: fingerprinting, persistent tokens, rate limiting, UA validation

const BAN_TOKEN_KEY = '_et_btk';
const BANNED_FPS_KEY = '_et_bfps';
const RATE_KEY = '_et_rl';
const SECRET = 'tsunami-shield-2024-x9k2m7';

// === Simple XOR cipher + base64 (obfuscation, not crypto-grade) ===
function encrypt(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ SECRET.charCodeAt(i % SECRET.length));
  }
  return btoa(out);
}
function decrypt(encoded) {
  try {
    const decoded = atob(encoded);
    let out = '';
    for (let i = 0; i < decoded.length; i++) {
      out += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET.charCodeAt(i % SECRET.length));
    }
    return out;
  } catch {
    return '';
  }
}

// === Browser Fingerprinting ===
// Combines screen, hardware, canvas, WebGL, timezone, language, platform
export async function generateFingerprint() {
  const parts = [];
  parts.push(`s:${screen.width}x${screen.height}x${screen.colorDepth}`);
  parts.push(`a:${screen.availWidth}x${screen.availHeight}`);
  parts.push(`c:${navigator.hardwareConcurrency || '?'}`);
  parts.push(`m:${navigator.deviceMemory || '?'}`);
  parts.push(`t:${navigator.maxTouchPoints || 0}`);
  parts.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  parts.push(`l:${(navigator.languages || [navigator.language]).join(',')}`);
  parts.push(`p:${navigator.platform}`);

  // Canvas rendering fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Escape Tsunami', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Escape Tsunami', 4, 17);
    parts.push(`cv:${canvas.toDataURL().length}`);
  } catch { parts.push('cv:x'); }

  // WebGL renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      parts.push(`gl:${ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'n/a'}`);
    }
  } catch { parts.push('gl:x'); }

  // djb2 hash
  const str = parts.join('|');
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

// === Persistent encrypted token (localStorage + cookie) ===
export function setBanToken(fingerprint) {
  const token = encrypt(`${fingerprint}:${Date.now()}`);
  try { localStorage.setItem(BAN_TOKEN_KEY, token); } catch {}
  try {
    document.cookie = `${BAN_TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Strict`;
  } catch {}
}

export function hasBanToken() {
  try {
    const token = localStorage.getItem(BAN_TOKEN_KEY);
    if (token && decrypt(token).includes(':')) return true;
  } catch {}
  try {
    const match = document.cookie.match(new RegExp(`${BAN_TOKEN_KEY}=([^;]+)`));
    if (match && decrypt(match[1]).includes(':')) return true;
  } catch {}
  return false;
}

// === Fingerprint ban list (localStorage) ===
export function addBannedFingerprint(fp) {
  try {
    const list = JSON.parse(localStorage.getItem(BANNED_FPS_KEY) || '[]');
    if (!list.includes(fp)) {
      list.push(fp);
      localStorage.setItem(BANNED_FPS_KEY, JSON.stringify(list));
    }
  } catch {}
}

export function isFingerprintBanned(fp) {
  try {
    const list = JSON.parse(localStorage.getItem(BANNED_FPS_KEY) || '[]');
    return list.includes(fp);
  } catch { return false; }
}

// === Rate Limiting ===
const RATE_WINDOW_MS = 30 * 1000; // 30 seconds
const RATE_MAX_LOADS = 10;        // 10 page loads per window

export function checkRateLimit() {
  try {
    const now = Date.now();
    const timestamps = (JSON.parse(localStorage.getItem(RATE_KEY) || '[]'))
      .filter((t) => now - t < RATE_WINDOW_MS);
    if (timestamps.length >= RATE_MAX_LOADS) return false;
    timestamps.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(timestamps));
    return true;
  } catch { return true; }
}

// === User-Agent & Header Validation ===
export function validateClient() {
  const ua = navigator.userAgent;
  // Empty or too short
  if (!ua || ua.length < 20) return false;
  // Headless / automation indicators
  const suspicious = ['headless', 'phantom', 'selenium', 'webdriver', 'puppeteer', 'playwright', 'nightmare'];
  if (suspicious.some((s) => ua.toLowerCase().includes(s))) return false;
  // Must contain a known browser engine token
  if (!/mozilla|webkit|gecko|trident|chromium|chrome|safari|firefox|edge/i.test(ua)) return false;
  // WebDriver flag set
  if (navigator.webdriver === true) return false;
  // Accept-Language equivalent must be present
  if (!navigator.language) return false;
  return true;
}