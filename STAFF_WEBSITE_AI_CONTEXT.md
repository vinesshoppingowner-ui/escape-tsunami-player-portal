# AI CONTEXT FILE — Escape Tsunami Staff Website + Member Portal API

> **How to use this file:** paste this entire document into Gemini / ChatGPT (or any AI coding assistant) as the **first message** of a new chat, before asking it to write or edit code. It gives the AI full knowledge of the site's files, the Member Portal API, and every data field — so it stops inventing endpoints and field names.

---

## 0. ROLE INSTRUCTIONS FOR THE AI

You are building/editing **the Staff Website** for *Escape Tsunami for Developers*.

Rules you must always follow:

1. **The Staff Website is a separate app** from the Member Portal. It does **not** have direct database access to portal data.
2. **All portal data comes from one API endpoint.** Never invent another URL, endpoint, action name, or field name. If something isn't in this document, say so instead of guessing.
3. **The lookup tool is admin-only.** Gate it behind `user.role === 'admin'` (or an owner flag). Regular staff must not see or use it — it exposes IP addresses and private notes.
4. **Never put the API key in frontend code.** The key must live in a backend function / server-side secret. If the app has no backend functions (free plan), tell the user instead of hardcoding the key in a `.jsx` file.
5. **Only edit the files you are told to edit.** Prefer small, focused files (under ~100 lines each) over one giant file.
6. **Stack:** React + Tailwind CSS, imported with the `@/` alias. Do not add new npm libraries.
7. Use `lucide-react` for icons — only icons that actually exist in that package.

---

## 1. THE MEMBER PORTAL API

### Endpoint

```
POST https://tsunami-shield-portal.base44.app/functions/syncApplications
```

### Authentication

Send the shared key as a header:

```
x-api-key: <GAME_LOG_API_KEY>
```

Without a valid key the endpoint also accepts a logged-in portal user with role `admin`, `staff`, or `is_owner === true`. A request with neither returns `401 { "error": "Unauthorized" }`.

### Request format

```json
{
  "action": "lookup_account",
  "account_id": "6a94d0a8d41cd1f012a10c09"
}
```

`account_id` accepts **any one of three values** — the endpoint auto-detects which:

| You send | It matches against |
| --- | --- |
| Portal Account ID (24-char hex) | user `.id` |
| Email address | user `.email` |
| Roblox username | user `.roblox_username` |

You may also send the query in `query`, `id`, `email`, or `roblox_username` instead of `account_id`.

### Responses

**Success — `200`**

```json
{ "status": "ok", "account": { ... }, "moderations": [], "appeals": [], ... }
```

**Not found — `404`**

```json
{ "status": "not_found", "account": null }
```

**Bad request — `400`** — `{ "error": "account_id or query is required" }`

**Unknown action — `400`** — `{ "error": "Unknown action" }`

**Server error — `500`** — `{ "error": "<message>" }`

---

## 2. `lookup_account` RESPONSE REFERENCE

### `account` object

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | The Portal Account ID — show with a copy button |
| `email` | string | Connected account email |
| `full_name` | string \| null | |
| `display_name` | string \| null | Preferred name to show |
| `bio` | string | May be empty string |
| `avatar_uri` | string \| null | Portal profile picture |
| `role` | string | `user` \| `staff` \| `admin` |
| `is_owner` | boolean | True for the portal owner |
| `roblox_username` | string \| null | |
| `roblox_user_id` | string \| null | Numeric Roblox ID as a string |
| `discord_id` | string \| null | Null if not connected |
| `discord_username` | string \| null | |
| `discord_avatar` | string \| null | |
| `created_date` | ISO string | Account created |
| `updated_date` | ISO string | |
| `last_seen` | ISO string \| null | Last activity |
| `last_ip` | string \| null | Most recent IP address |
| `ip_history` | string[] | All IPs seen |
| `ip_banned` | boolean | True if the last IP is banned |
| `ip_bans` | object[] | Matching `IpBan` records (see below) |
| `banned` | boolean | Portal account ban |
| `banned_reason` | string \| null | |
| `banned_by` | string \| null | |
| `appeals_locked` | boolean | Player blocked from submitting appeals |
| `google_locked` | boolean | Google sign-in disabled |
| `force_password_reset` | boolean | |
| `application_blacklisted` | boolean | |
| `application_blacklist_entries` | object[] | Matching blacklist records |
| `preferences.accent` | string | e.g. `cyan`, `violet` |
| `preferences.landing_page` | string | e.g. `/` |
| `preferences.hide_online_status` | boolean | |

### Top-level activity arrays (always present, empty array when none)

`moderations` · `appeals` · `application_responses` · `bug_reports` · `watchlist` · `staff_notes` · `notifications` · `verifications` · `streak` (object or `null`)

Limits: moderations 100, appeals 100, application_responses 100, bug_reports 50, staff_notes 50, notifications 50, watchlist 25, verifications 25, ip_bans 10, blacklist entries 10.

### Fields per record type

**`moderations[]`** — `id`, `roblox_username`, `moderation_type` (`Warning` | `Mute` | `Kick` | `Temporary Ban` | `Permanent Ban`), `reason`, `details`, `moderation_date`, `duration`, `status` (`Active` | `Expired` | `Repealed`), `staff_member`, `evidence_type` (`none` | `chat_log` | `screenshot`), `evidence_text`, `evidence_image_url`, `evidence_files[]`, `player_notified`, `created_date`

**`appeals[]`** — `id`, `moderation_id` (or `"unlisted"`), `roblox_username`, `appeal_reason`, `why_accepted`, `deserved_infraction`, `unlisted_type`, `unlisted_date`, `unlisted_reason`, `status` (`Pending` | `Under Review` | `Approved` | `Denied`), `thread_status` (`Awaiting Review` | `Under Review` | `Awaiting Evidence` | `Resolved`), `staff_response`, `internal_notes`, `decided_by`, `decided_at`, `can_reappeal`, `reappeal_after`, `reappeal_guidance`, `admin_locked`, `locked_by`, `removed`, `removed_by`, `removed_at`, `assigned_to`, `assigned_to_email`, `assigned_at`, `chat_locked`, `created_date`

**`application_responses[]`** — `id`, `application_id`, `application_title`, `roblox_username`, `submitted_by_email`, `answers` (JSON **string** of `question_id -> answer`), `status` (`submitted` | `under_review` | `accepted` | `rejected`), `staff_notes`, `applicant_feedback`, `reviewed_by`, `reviewed_at`, `attempt`, `retake_allowed`, `ai_score`, `ai_recommendation` (`accept` | `review` | `reject`), `ai_summary`, `ai_review` (JSON string), `staff_rating` (1–5), `tags[]`, `starred`, `created_date`

**`bug_reports[]`** — `id`, `roblox_username`, `title`, `description`, `severity` (`Low` | `Medium` | `High` | `Critical`), `status` (`Submitted` | `Confirmed` | `Declined`), `created_date`

**`watchlist[]`** — `id`, `roblox_username`, `reason`, `level` (`low` | `medium` | `high`), `added_by`, `created_date`

**`staff_notes[]`** — `id`, `roblox_username`, `note`, `author`, `created_date`

**`notifications[]`** — `id`, `roblox_username`, `title`, `body`, `type` (`appeal_decision` | `moderation_issued` | `moderation_expired` | `staff_message`), `read`, `created_date`

**`verifications[]`** — `id`, `roblox_username`, `code`, `status` (`pending` | `approved` | `denied`), `reviewer_note`, `created_date`

**`ip_bans[]`** — `id`, `ip_address`, `created_date` (plus any additional ban metadata on the record)

**`application_blacklist_entries[]`** — `id`, `identifier` (lowercase email or username), `roblox_username`, `reason`, `banned_by`, `linked_moderation_id`, `created_date`

**`streak`** — `id`, `roblox_username`, `total_days_claimed`, `current_streak`, `tag_unlocked`, `last_claimed_date`, `discord_id`

### Example response (real record, trimmed)

```json
{
  "status": "ok",
  "account": {
    "id": "6a94d0a8d41cd1f012a10c09",
    "email": "vinesshoppingowner@gmail.com",
    "display_name": "AutomatedMessage",
    "role": "admin",
    "is_owner": false,
    "roblox_username": "testuser123",
    "roblox_user_id": "13083694",
    "discord_id": null,
    "created_date": "2026-08-31T00:54:00.614000Z",
    "last_seen": "2026-10-20T22:40:56.861Z",
    "last_ip": "173.31.188.150",
    "ip_history": ["173.31.188.150"],
    "ip_banned": false,
    "banned": false,
    "appeals_locked": false,
    "google_locked": true,
    "application_blacklisted": false,
    "preferences": { "accent": "cyan", "landing_page": "/", "hide_online_status": false }
  },
  "moderations": [
    { "id": "6ad0162df5625ba277f7de2c", "moderation_type": "Permanent Ban", "reason": "Exploiting", "status": "Active", "moderation_date": "2026-10-14T23:54:19.697Z", "roblox_username": "testuser123" }
  ],
  "appeals": [
    { "id": "6ad016853e3e9ed15574caa8", "moderation_id": "6ad0162df5625ba277f7de2c", "status": "Pending", "thread_status": "Awaiting Review", "appeal_reason": "False ban help me please", "created_date": "2026-10-14T23:55:49.571000" }
  ],
  "application_responses": [],
  "bug_reports": [],
  "watchlist": [],
  "staff_notes": [],
  "notifications": [],
  "verifications": [],
  "streak": null
}
```

---

## 3. OTHER ACTIONS ON THE SAME ENDPOINT

All use the same URL and `x-api-key` header. Send them as `POST` with an `action` field.

| Action | Body fields | Returns |
| --- | --- | --- |
| `pull` (default) | *none* | `{ status, count, applications[], responses[], blacklist[] }` — full application bundle |
| `lookup_account` | `account_id` (or `query` / `id` / `email` / `roblox_username`) | Full account dossier (section 2) |
| `upsert_application` | `application: { id?, title, description, status, category, icon, slug, success_message, auto_close_at, questions, settings }` | `{ status, application }` |
| `delete_application` | `id` | `{ status: 'ok' }` — also deletes its responses |
| `update_response` | `id`, plus any of `status`, `staff_notes`, `applicant_feedback`, `retake_allowed`, `staff_rating`, `tags`, `starred`, `reviewed_by` | `{ status, response }` — auto-notifies the applicant on accept/reject or retake |
| `delete_response` | `id` | `{ status: 'ok' }` |
| `manage_blacklist` | `op: 'add'` + `identifier`, `reason`, `banned_by`, `roblox_username?` — or `op: 'remove'` + `id` | `{ status, entry }` / `{ status: 'ok' }` |

A `GET` request to the same URL returns the same bundle as `pull`.

**Other portal endpoints exist** (separate functions, documented by the portal owner): `syncModeration`, `syncAppealMessages`, `syncBugReports`, `gameSessions`, `checkPlayerBan`, `getPlayerWarnings`, `robloxLookup`, `bloxlinkLookup`, `getDiscordProfile`, `adminVerifyRoblox`, `reactivateAccount`, `robloxBioVerify`, `loginOtp`, `submit-game-logs`, `discordSend`, `spotifyMusic`, `checkGoogleSubscription`, `googleFormsSync`, `syncApplicationToSheet`, `autoAssignAppeal`, `expireTempBans`, `revertStaffWaitrose`, `assign-devoted-role`. Do not guess their request shapes — ask before using them.

---

## 4. REQUIRED FILE STRUCTURE

Build the lookup feature as these focused files. Do not merge them into one file.

| File | Responsibility |
| --- | --- |
| `src/lib/portalApi.js` | The single API helper. One exported function `lookupPortalAccount(query)`. |
| `src/components/portal-lookup/AccountLookupSearch.jsx` | Search input, Search button, loading spinner, error text. |
| `src/components/portal-lookup/AccountSummaryCard.jsx` | Identity + security summary card. |
| `src/components/portal-lookup/ActivityList.jsx` | One generic, reusable table (props: `title`, `columns`, `rows`, `emptyText`). |
| `src/components/portal-lookup/ActivitySections.jsx` | Uses `ActivityList` for moderations, appeals, applications, bug reports, verifications, notifications, watchlist, staff notes. |
| `src/pages/PortalLookupPage.jsx` | Assembles search + summary + sections. Admin-only guard lives here. |
| `src/App.jsx` | Register the route `/portal-lookup`. |

---

## 5. REFERENCE CODE

### `src/lib/portalApi.js` (browser-safe version — key is NOT here)

```js
const PORTAL_API = 'https://tsunami-shield-portal.base44.app/functions/syncApplications';

/**
 * Look up a portal account by Portal Account ID, email, or Roblox username.
 * Calls our own backend function, which holds the API key server-side.
 */
export async function lookupPortalAccount(query) {
  const res = await fetch('/api/lookup-portal-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Lookup failed (${res.status})`);
  }
  if (data.status === 'not_found' || !data.account) {
    throw new Error('No portal account found for that ID, email, or username.');
  }
  return data;
}
```

> The `/api/lookup-portal-account` server route (or backend function) is what talks to the portal, adding the `x-api-key` header. **If this app has no backend functions, stop and tell the user — do not inline the key here.**

### Backend function body (server-side, key from a secret)

```js
const res = await fetch('https://tsunami-shield-portal.base44.app/functions/syncApplications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.GAME_LOG_API_KEY,
  },
  body: JSON.stringify({ action: 'lookup_account', account_id: query }),
});
return await res.json();
```

### `src/components/portal-lookup/AccountLookupSearch.jsx`

```jsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

export default function AccountLookupSearch({ onSearch, loading }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Portal Account ID, email, or Roblox username"
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !value.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        Search
      </Button>
    </form>
  );
}
```

### `src/components/portal-lookup/ActivityList.jsx`

```jsx
export default function ActivityList({ title, columns, rows, emptyText = 'None on record' }) {
  const items = Array.isArray(rows) ? rows : [];

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">
        {title} <span className="text-slate-500 font-normal">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                {columns.map((c) => (
                  <th key={c.key} className="py-2 pr-4 font-medium whitespace-nowrap">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={row.id || i} className="border-b border-white/5 last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="py-2 pr-4 text-slate-300 align-top">
                      {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
```

### Column definitions for `ActivitySections.jsx`

```js
const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

export const moderationColumns = [
  { key: 'moderation_type', label: 'Type' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
  { key: 'staff_member', label: 'Staff' },
  { key: 'moderation_date', label: 'Date', render: (r) => fmt(r.moderation_date) },
];

export const appealColumns = [
  { key: 'status', label: 'Status' },
  { key: 'thread_status', label: 'Thread' },
  { key: 'appeal_reason', label: 'Reason' },
  { key: 'decided_by', label: 'Decided By', render: (r) => r.decided_by || '—' },
  { key: 'created_date', label: 'Submitted', render: (r) => fmt(r.created_date) },
];

export const applicationColumns = [
  { key: 'application_title', label: 'Form' },
  { key: 'status', label: 'Status' },
  { key: 'attempt', label: 'Attempt' },
  { key: 'ai_score', label: 'AI Score', render: (r) => r.ai_score ?? '—' },
  { key: 'created_date', label: 'Submitted', render: (r) => fmt(r.created_date) },
];

export const bugReportColumns = [
  { key: 'title', label: 'Title' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'created_date', label: 'Reported', render: (r) => fmt(r.created_date) },
];

export const verificationColumns = [
  { key: 'roblox_username', label: 'Roblox Username' },
  { key: 'status', label: 'Status' },
  { key: 'reviewer_note', label: 'Note', render: (r) => r.reviewer_note || '—' },
  { key: 'created_date', label: 'Requested', render: (r) => fmt(r.created_date) },
];

export const notificationColumns = [
  { key: 'title', label: 'Title' },
  { key: 'body', label: 'Body' },
  { key: 'read', label: 'Read', render: (r) => (r.read ? 'Yes' : 'No') },
  { key: 'created_date', label: 'Sent', render: (r) => fmt(r.created_date) },
];

export const watchlistColumns = [
  { key: 'reason', label: 'Reason' },
  { key: 'level', label: 'Level' },
  { key: 'added_by', label: 'Added By' },
  { key: 'created_date', label: 'Added', render: (r) => fmt(r.created_date) },
];

export const staffNoteColumns = [
  { key: 'note', label: 'Note' },
  { key: 'author', label: 'Author' },
  { key: 'created_date', label: 'Written', render: (r) => fmt(r.created_date) },
];
```

### `src/pages/PortalLookupPage.jsx`

```jsx
import { useState } from 'react';
import { lookupPortalAccount } from '@/lib/portalApi';
import AccountLookupSearch from '@/components/portal-lookup/AccountLookupSearch';
import AccountSummaryCard from '@/components/portal-lookup/AccountSummaryCard';
import ActivitySections from '@/components/portal-lookup/ActivitySections';

export default function PortalLookupPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await lookupPortalAccount(query));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Portal Account Lookup</h1>
        <p className="text-sm text-slate-400 mt-1">
          Search any member by their Portal Account ID, email, or Roblox username.
        </p>
      </div>

      <AccountLookupSearch onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {result?.account && (
        <>
          <AccountSummaryCard account={result.account} />
          <ActivitySections data={result} />
        </>
      )}
    </div>
  );
}
```

### Route registration in `src/App.jsx`

```jsx
<Route path="/portal-lookup" element={<PortalLookupPage />} />
```

Add the import next to the other page imports, and gate the whole route behind the existing admin guard.

---

## 6. `AccountSummaryCard.jsx` REQUIREMENTS

Render three clearly separated groups. Every value falls back to `—` when null/empty.

1. **Identity** — Portal Account ID (monospace, **copy button**), Email, Display Name, Bio, Role, Owner badge, Created, Last Seen.
2. **Linked Accounts** — Roblox Username + Roblox User ID, Discord Username + Discord ID.
3. **Security & Restrictions** — Last IP, IP History (list each), IP Banned, Account Banned (+ reason + by), Appeals Locked, Google Locked, Force Password Reset, Application Blacklisted. Use red/amber badges when any of these are true, green when clear.

Show a prominent warning strip at the top of the card stating: **"Sensitive data — visible to admins only."**

Use existing shadcn components from `@/components/ui/` (`Card`, `Badge`, `Button`) and Tailwind utility classes. Do not hardcode hex colors — use the site's design tokens and standard Tailwind palette classes.

---

## 7. CHECKLIST BEFORE FINISHING ANY CHANGE

- [ ] No invented endpoints, actions, or field names — everything matches this document.
- [ ] API key is server-side only, never in a `.jsx` file.
- [ ] Lookup route is admin-only.
- [ ] Every file is focused and small; no giant single file.
- [ ] Loading, empty (no results), and error states all render something visible.
- [ ] Every top-level activity array is rendered, even when empty.
- [ ] No new npm packages added.
- [ ] `@/` alias used for imports.