const KEY = 'et_passcode_login';

export function getPasscodeLogin() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export function isPasscodeLoginAvailable() {
  return !!getPasscodeLogin();
}

export function savePasscodeLogin(passcode, token, email, userId) {
  localStorage.setItem(KEY, JSON.stringify({ passcode, token, email, userId, setAt: Date.now() }));
}

export function clearPasscodeLogin() {
  localStorage.removeItem(KEY);
}

export function tryPasscodeLogin(passcode) {
  const stored = getPasscodeLogin();
  if (!stored || stored.passcode !== passcode) return false;
  localStorage.setItem('base44_access_token', stored.token);
  return true;
}

// Keep the saved token fresh whenever the user is logged in
export function refreshPasscodeToken() {
  const stored = getPasscodeLogin();
  if (!stored) return;
  const currentToken = localStorage.getItem('base44_access_token');
  if (currentToken && currentToken !== stored.token) {
    stored.token = currentToken;
    localStorage.setItem(KEY, JSON.stringify(stored));
  }
}

// Sync the passcode to the user's server-side data so staff can view/manage it
export async function syncPasscodeToServer(passcode) {
  try {
    const { base44 } = await import('@/api/base44Client');
    await base44.auth.updateMe({ data: { quick_passcode: passcode } });
  } catch { /* non-critical */ }
}

// Clear the server-side passcode
export async function clearServerPasscode() {
  try {
    const { base44 } = await import('@/api/base44Client');
    await base44.auth.updateMe({ data: { quick_passcode: null } });
  } catch { /* non-critical */ }
}