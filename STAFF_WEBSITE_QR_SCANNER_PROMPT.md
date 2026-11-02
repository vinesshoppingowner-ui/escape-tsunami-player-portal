# PASTE THIS INTO THE STAFF WEBSITE BUILDER

> Copy everything below the line into the AI building the **Staff Website**
> (staff.escapetsunamifordevelopers.com). It pairs with `STAFF_WEBSITE_AI_CONTEXT.md`,
> so paste that first if the AI doesn't already have it.

---

## FEATURE: Scan a member's ID code and act on their account

Members can now generate a free personal QR code in the Member Portal settings
(**Settings → Account & Profile → "Your Staff ID Code"**). Staff must be able to
scan that code on the staff website and instantly work with the account.

### 1. The scan code format

The QR contains plain text, one of:

- `etsu-acct:<portal_account_id>` ← what the portal produces today
- a bare 24-character hex account id
- a URL carrying `?acct=<id>` or `?account_id=<id>`

Write one helper that takes the decoded text and returns the account id:

```js
export function parseAccountQr(text) {
  const raw = String(text || '').trim();
  if (raw.toLowerCase().startsWith('etsu-acct:')) return raw.slice(10).trim();
  if (/^[0-9a-fA-F]{20,36}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    return (url.searchParams.get('acct') || url.searchParams.get('account_id') || '').trim();
  } catch {
    return '';
  }
}
```

### 2. The scanner UI

- Add a **"Scan member code"** button on the account-lookup page (and in the staff
  dashboard header). Admin/owner only.
- It opens a full-screen camera view using `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })`.
- Decode frames with the browser's `BarcodeDetector` when available; otherwise load
  `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js` on demand and scan a
  480px-wide canvas frame. Do not add an npm package.
- Draw a scanning frame overlay with corner brackets and a pulsing line. Show the
  camera error clearly (blocked permission / no camera) and offer manual ID entry.
- On a successful read: stop the camera, parse the id, run the lookup below.
- Keep a manual fallback input for a pasted Account ID, email or Roblox username.

### 3. The lookup (already exists — do not invent an endpoint)

Server-side only, from your own backend function:

```
POST https://tsunami-shield-portal.base44.app/functions/syncApplications
Headers: { "Content-Type": "application/json", "x-api-key": <GAME_LOG_API_KEY secret> }
Body:    { "action": "lookup_account", "account_id": "<id from the QR>" }
```

- The key is a server secret. **Never** call this from the browser and never hardcode the key.
- `200 { status: "ok", account, moderations, appeals, application_responses, bug_reports, watchlist, staff_notes, notifications, verifications, streak }`
- `404 { status: "not_found" }` → show "No portal account matches that code."
- The account object includes: `id, email, display_name, avatar_uri, role, is_owner,
  roblox_username, created_date, last_seen, last_ip, ip_history, ip_banned,
  banned, banned_reason, banned_by, appeals_locked, google_locked,
  force_password_reset, application_blacklisted, application_blacklist_entries, preferences`.

### 4. What staff see after scanning

One dossier card, in this order: avatar + display name + `@roblox_username`,
email, role chip (Owner / Staff / Member), account id (copyable), joined date,
last seen, last IP, portal ban state, application-blacklist state, appeal lock
state. Then collapsible lists: moderations, appeals, application responses,
staff notes, watchlist, bug reports, verification requests.

### 5. Actions

**Ban the account (works today)** — this is the portal's blacklist, which also
files a Permanent Ban moderation the member sees and can appeal:

```
POST /functions/syncApplications
{ "action": "manage_blacklist",
  "op": "add",
  "identifier": "<roblox_username, or the member's email if no Roblox username>",
  "roblox_username": "<same username>",
  "reason": "<why>",
  "banned_by": "<staff name>" }
```

**Unban (works today)** — read the entry id from `account.application_blacklist_entries[0].id`:

```
{ "action": "manage_blacklist", "op": "remove", "id": "<entry id>" }
```

Both need a confirm dialog that states the consequence, and must be admin-only.

**Delete the account (NOT available through the portal API)** — do not build a
button that pretends to do it. The portal API has no delete-account action, and
the staff site has no database access. Show a disabled "Delete account" item with
the note: *"Permanently deleting a portal account is done in Base44 → App Users.
Ask an owner to remove it there."* If the portal later adds a delete endpoint,
wire it then.

### 6. Rules

- Admin/owner only; hide the whole scanner for regular staff.
- Never log the API key or a full account dump to the console.
- Keep new files small and focused (`AccountScannerDialog.jsx`, `parseAccountQr.js`,
  `AccountDossier.jsx`, `AccountActions.jsx`).
- No new npm packages; use `lucide-react` icons only.