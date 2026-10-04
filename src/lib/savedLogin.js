// Device-only "remember my login". Email is kept in localStorage; the password is handed
// to the browser's own secure password manager (never stored by the site itself).
const KEY = 'et_saved_login';

export const getSavedLogin = () => JSON.parse(localStorage.getItem(KEY) || 'null');
export const isRememberEnabled = () => !!getSavedLogin();
export const setRememberEnabled = (on, email = '') =>
  on ? localStorage.setItem(KEY, JSON.stringify({ email })) : localStorage.removeItem(KEY);

export async function saveCredentials(email, password) {
  if (!isRememberEnabled()) return;
  localStorage.setItem(KEY, JSON.stringify({ email }));
  if (window.PasswordCredential) {
    await navigator.credentials.store(new window.PasswordCredential({ id: email, password })).catch(() => {});
  }
}

export async function loadCredentials() {
  const saved = getSavedLogin();
  if (!saved) return null;
  if (window.PasswordCredential) {
    const cred = await navigator.credentials.get({ password: true, mediation: 'optional' }).catch(() => null);
    if (cred?.password) return { email: cred.id, password: cred.password };
  }
  return { email: saved.email, password: '' };
}