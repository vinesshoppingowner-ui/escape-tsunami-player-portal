/**
 * Staff access badges can carry a member's sign-in details so scanning the code
 * signs them straight in. The pair travels as one opaque token instead of plain
 * text so the password isn't sitting visibly in the address bar or a copied link.
 */
export function encodeBadgeCredentials(email, password) {
  const bytes = new TextEncoder().encode(`${email}:${password}`);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBadgeCredentials(token) {
  if (!token) return null;
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const raw = new TextDecoder().decode(bytes);
    const split = raw.indexOf(':');
    if (split < 1) return null;
    return { email: raw.slice(0, split), password: raw.slice(split + 1) };
  } catch {
    return null;
  }
}

/** Reads sign-in details from the current URL: ?badge=<token> or ?email=<email>. */
export function readBadgeLogin() {
  const params = new URLSearchParams(window.location.search);
  const decoded = decodeBadgeCredentials(params.get('badge'));
  if (decoded) return decoded;
  const email = (params.get('email') || '').trim();
  return email ? { email, password: '' } : null;
}