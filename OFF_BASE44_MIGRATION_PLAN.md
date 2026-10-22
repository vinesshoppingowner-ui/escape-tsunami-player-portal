# Escape Tsunami Player Portal — Migration Plan (running off Base44)

**Status:** planning document. Nothing in here is built. This is the spec of what it takes to run this app somewhere other than Base44.
**Written:** 2026-10-22 · **App:** Escape Tsunami Player Portal (`tsunami-shield-portal.base44.app`)

---

## 0. The short version

The code you download is the **front end only**. Everything that makes it a working portal — the database, who can read and write what, all logins, and 26 server functions — runs on Base44. So "running without Base44" is not a file cleanup; it is a full rebuild of the backend plus a new host.

- **Scale:** 24 data tables, 26 server functions, 2 scheduled/triggered workflows, 2 OAuth connectors, private file storage, email sending, AI calls, live-updating lists, and 4 outside systems (the Roblox game scripts, the Discord bot, the external Staff Website and a bans service) that talk to this app.
- **Realistic effort:** weeks of focused full-stack work, not days, plus new infrastructure accounts.
- **Safety:** none of this touches the live app. Base44 keeps running until you deliberately cut over, and you can keep it as a fallback.

---

## 1. Inventory — what Base44 is doing for you today

| Base44 piece | What it does in your app | What you must build instead |
|---|---|---|
| Database + REST API + Row-Level Security | 24 entities hold every record (moderations, appeals, applications, sessions, logs). Each entity has read/create/update/delete rules scoped to player, staff, admin or owner. | Postgres tables + your own API + RLS policies |
| User entity + Auth | Sign-up, email verification, one-time codes, password reset, Google / Microsoft / Apple login, invite-only access, roles (`admin`, `staff`, `user`) and 22 custom profile fields (Roblox link, bans, suspensions, IP history, staff notes…) | Auth service + profiles table |
| 26 backend functions (Deno, TypeScript) | All server logic: Roblox lookups/OAuth, Discord, Google Sheets & Forms, game log ingestion, appeal chat sync, bans, application submission | Your own functions/server routes |
| 2 workflows | `Auto Expire Temp Bans` — cron every 15 min. `Auto Assign Appeals` — fires when an Appeal is created (if unassigned) | Cron job + database trigger/webhook |
| Private file storage + signed URLs | Moderation evidence images, appeal chat images, avatars. 5 call sites (upload private, upload public, create signed URL). | Object storage (S3 / R2 / Supabase Storage) + signed URLs |
| Email sending | 3 direct sends, plus platform-sent verification / OTP / password-reset mail | An email provider (Resend / SES / Postmark / SMTP) + templates |
| AI calls (`InvokeLLM`) | 3 call sites, e.g. AI screening of job applications | Your own LLM API key |
| App-user connectors | Google Sheets (sheet sync) and GitHub — each user connects their own account | Your own OAuth apps + per-user token storage |
| Realtime subscriptions | 9 front-end files subscribe to live record changes | A realtime channel / websocket |
| Hosting, publishing, secrets, logs | The published URL, custom domain, secret store, runtime logs, preview | Your own host, env vars, logging |

---

## 2. Outside systems that must be re-pointed (the part people forget)

| System | How it talks to the portal | What changes |
|---|---|---|
| Roblox in-game scripts (`render-server/`, `src/render-server/` — 7 Lua files) | Call portal endpoints with a shared `x-api-key` header | Re-point to your new API base URL |
| Discord moderation poller (`src/render-server/discord-moderation-poller.js`) | Polls pending `DiscordAction` records and executes them | Re-point to your API |
| External Staff Website (`staff.escapetsunamifordevelopers.com`) | Calls `syncApplications` (pull, upsert, response decisions, blacklist, `lookup_account` dossier) with `x-api-key` or an authenticated staff user | Same contract must be reimplemented **and** the Staff Website updated in the same release |
| Bans service (`escape-tsunami-bans.onrender.com`) | Called from a backend function | Re-point / confirm it still exists |
| Base44's own REST API | Two functions call `base44.app/api/apps/…/prod/users/` for user data | Replace with your own user endpoint |
| Roblox OAuth app | Redirect URI is registered as `…/roblox-callback` on the Base44 domain | Re-register the redirect URI on your new domain |
| Google Cloud OAuth client (Sheets, Forms, Drive) | Used by the Sheets/Forms sync | Re-register redirect URI for the new host |
| GitHub OAuth app | Used by the GitHub connector | Re-register redirect URI |
| Discord application | Bot token, guild ID, devoted-role ID | Keep the app, move the token into your env |
| 7 secrets | `BLOXLINK_API_KEY`, `DISCORD_BOT_TOKEN`, `DISCORD_DEVOTED_ROLE_ID`, `DISCORD_GUILD_ID`, `GAME_LOG_API_KEY`, `ROBLOX_CLIENT_ID`, `ROBLOX_CLIENT_SECRET` | Recreate as env vars on your host |

Third-party APIs the backend already calls (all keep working, they just need your own keys where applicable): `apis.roblox.com` (OAuth), `users.roblox.com`, `groups.roblox.com`, `thumbnails.roblox.com`, `discord.com/api`, `api.blox.link`, `sheets.googleapis.com`, `forms.googleapis.com`, `www.googleapis.com/drive`, `api.deezer.com`, `youtube.com`.

---

## 3. Recommended target stack

**Supabase is the closest 1:1 fit** for this app:

- **Postgres with row-level security** — the direct equivalent of your per-entity access rules (24 rule sets).
- **Auth** — email + password, one-time codes, OAuth providers, roles; supports the invite-only model.
- **Storage** — private buckets and signed URLs, matching your private-file pattern.
- **Realtime** — replaces the 9 live-subscription files.
- **Edge Functions (Deno)** — your 26 functions are already Deno TypeScript, so the function bodies port with the least friction.
- **pg_cron** — replaces the 15-minute workflow.

Alternatives: **Firebase** (fast to start, but a much worse fit for your SQL-shaped data and RLS rules), or **Node/Express + Postgres + S3 + Auth.js** on Vercel/Render (most control, most work).

---

## 4. Data model port (24 entities)

- One table per entity, plus the four built-ins: `id`, `created_date`, `updated_date`, `created_by_id`.
- **JSON-stored-as-text fields become real JSON columns** (`jsonb`) and stop needing client-side parsing: `Application.questions`, `Application.settings`, `ApplicationResponse.answers`, `ApplicationResponse.ai_review`, `StaffLog.undo_ops`.
- **Enums become check constraints**: `Appeal.status` / `thread_status`, `Moderation.moderation_type` / `status` / `evidence_type`, `ApplicationResponse.status` / `ai_recommendation`, `BugReport.severity` / `status`, `Notification.type`, `StaffLog.action`, `Announcement.type`, `SiteSettings.banner_color` / `site_status`, `VerificationRequest.status`, `DiscordAction.action_type` / `status`, `WatchlistEntry.level`, `KnowledgeBaseEntry.category`.
- **User profile fields** (22) move to a `profiles` table keyed by the auth user id: role, `roblox_username`, `is_owner`, `banned` + reason/date/by/until, `suspended` + reason/date/by, `muted_until`, `google_locked`, `appeals_locked`, `force_password_reset`, `has_password`, `roblox_verified`, `last_ip`, `last_seen`, `login_attempts`, `denied_permissions`, `staff_notes_private`.
- **Row-level security — the highest-risk part.** Your rules gate on five things: (a) the record's `roblox_username` equals the signed-in user's `roblox_username`, (b) role `admin` / `staff`, (c) the `is_owner` flag, (d) `created_by_id` equals the user, (e) boolean flags that hide data (`AppealMessage.internal`, `Appeal.removed`). Port every read/create/update/delete rule verbatim, then test with a second account per role — a mistake here leaks player IPs, staff notes or internal appeal notes.
- **Files inside records** (`Moderation.evidence_files`, evidence image URLs, `AppealMessage.image_uri`, user avatars) are Base44 storage URIs. Download the binaries, upload them to your own storage, then rewrite the fields with a scripted pass.
- **Before cutover:** export every record of every entity to a JSON/CSV backup.

---

## 5. Auth to rebuild (the biggest single chunk)

Core flows the front end already uses (each must exist on the new backend):
`register`, `verifyOtp`, `resendOtp`, `loginViaEmailPassword`, `loginWithProvider` (google / microsoft / apple — 5 call sites), `resetPasswordRequest`, `resetPassword`, `setToken`, `me`, `updateMe`, `logout`, `isAuthenticated`, `redirectToLogin`, and admin-only `inviteUser`.

Custom auth layered on top:
- Email one-time-code login (`loginOtp` function).
- Staff quick passcode login (`src/lib/passcodeLogin.js`) and saved-login (`src/lib/savedLogin.js`).
- Roblox OAuth (`robloxOAuth`, `RobloxOAuthCallbackPage`, `ROBLOX_CLIENT_ID` / `ROBLOX_CLIENT_SECRET`).
- Roblox bio-code verification (`robloxBioVerify`, `adminVerifyRoblox`) and Bloxlink lookup (`BLOXLINK_API_KEY`).
- Discord account linking (`getDiscordProfile`).
- IP tracking (`last_ip`, `ip_history`), IP bans (`IpBan`, `checkPlayerBan`, `src/lib/banEvasion.js`).
- Account states enforced on every request: banned, suspended, muted, appeals locked, Google locked, force password reset.
- Invite-only access, including the "user not registered" gate in `src/lib/AuthContext.jsx`.

Verification, OTP and reset emails must now be sent by your own email provider.

---

## 6. The 26 functions to port

| Function | Purpose | Depends on |
|---|---|---|
| `autoAssignAppeal` | Assign a new appeal to the lightest staff queue | DB only — easy first port |
| `expireTempBans` | Expire finished temp bans, notify + unban in-game | DB, in-game hook |
| `gameSessions` | Record player sessions pushed from the game server | DB, `x-api-key` |
| `checkPlayerBan` | Ban check used by the game scripts | DB, `x-api-key` |
| `robloxLookup` | Roblox username / avatar lookup | Roblox public APIs |
| `robloxBioVerify` | Verify Roblox ownership via bio code | Roblox public APIs |
| `adminVerifyRoblox` | Admin-verified Roblox link, no OAuth | Roblox public APIs |
| `robloxOAuth` | Roblox OAuth token exchange + userinfo | `ROBLOX_CLIENT_ID/SECRET`, `apis.roblox.com` |
| `bloxlinkLookup` | Discord↔Roblox lookup via Bloxlink | `BLOXLINK_API_KEY` |
| `getDiscordProfile` | Fetch and cache a Discord profile | `discord.com/api` |
| `discordSend` | Send Discord messages / moderation actions | `DISCORD_BOT_TOKEN` |
| `assign-devoted-role` | Grant the "devoted" Discord role | Discord token, guild + role IDs |
| `googleFormsSync` | Import/sync Google Form responses | Google Forms + Drive APIs |
| `syncApplicationToSheet` | Append submissions to a Google Sheet | Google Sheets connector |
| `checkGoogleSubscription` | Verify a Google/YouTube subscription | Google APIs |
| `submit-game-logs` | Ingest in-game chat/moderation logs | `GAME_LOG_API_KEY` |
| `submitApplication` | Application submission + notifications | DB, email |
| `syncModeration` | Two-way moderation sync with the Staff Website | `GAME_LOG_API_KEY` |
| `syncAppealMessages` | Two-way appeal-chat sync | `GAME_LOG_API_KEY` |
| `syncBugReports` | Two-way bug-report sync | `GAME_LOG_API_KEY` |
| `syncApplications` | The whole bidirectional Staff Website API, incl. the `lookup_account` dossier (PII, IP history, moderation + appeal logs, applications, bug reports, verifications) | `GAME_LOG_API_KEY` |
| `loginOtp` | Email one-time-code login | Email provider |
| `reactivateAccount` | Lift a ban for the last known IP | DB |
| `revertStaffWaitrose` | Undo a staff action using the undo log | DB |
| `spotifyMusic` | Music lookup for the in-game/portal player | Deezer + YouTube |
| `getPlayerWarnings` | In-game warnings for a player | External warning API + keys |

**Contract warning:** the four `sync*` functions plus `submit-game-logs` and `gameSessions` are the **agreed API between this portal, the Roblox game scripts and the external Staff Website**. Whatever you build must honour the same request/response shapes, or all three move together in one release.

---

## 7. Front-end rewiring — do it with ONE adapter

59 files import `@/api/base44Client`; 2 import `@base44/sdk` directly. **Do not edit 59 files.** Write one replacement client that exposes the same surface against your new API:

- `entities.<Entity>.list / filter / get / create / update / delete / count / aggregate / subscribe`
- `auth.*` (the list in section 5)
- `functions.invoke(name, payload)`
- `integrations.Core.InvokeLLM / SendEmail / UploadPrivateFile / UploadPublicFile / CreateFileSignedUrl`
- `connectors.connectAppUser / disconnectAppUser`

Then only these change: `src/api/base44Client.js`, `src/lib/AuthContext.jsx`, `src/lib/app-params.js`, `index.html` (drop the Base44 runtime script), `vite.config.js` (drop `@base44/vite-plugin`), `package.json` (drop `@base44/sdk`). Everything else keeps working unchanged.

Also replace: the platform-injected environment values (`VITE_BASE44_APP_ID`, `…_FUNCTIONS_VERSION`, `…_APP_BASE_URL`), the `base44_access_token` entry in local storage, and the 9 `.subscribe(...)` call sites (wire to your realtime channel).

---

## 8. Suggested order of work

1. **Database** — create the 24 tables, enums and RLS policies; script the export/import; verify against a read-only clone with one account per role.
2. **Auth** — email + password + OTP + reset + OAuth providers, profiles with the 22 fields, roles, invite-only gate. Swap the front end over in one pass.
3. **Adapter client** — get the existing front end reading from the new API, untouched screen by screen.
4. **Functions**, in dependency order: DB-only (`autoAssignAppeal`, `expireTempBans`, `gameSessions`, `reactivateAccount`, `revertStaffWaitrose`) → Roblox (`robloxLookup`, `robloxBioVerify`, `adminVerifyRoblox`, `robloxOAuth`) → Discord (`discordSend`, `assign-devoted-role`, `getDiscordProfile`, `bloxlinkLookup`) → Google (`googleFormsSync`, `syncApplicationToSheet`, `checkGoogleSubscription`) → the shared API surface (`submit-game-logs`, `syncModeration`, `syncAppealMessages`, `syncBugReports`, `syncApplications`).
5. **Storage** — private buckets + signed URLs; migrate evidence images and avatars; rewrite the stored URIs.
6. **Email + AI** — your own provider for transactional mail, your own key for the AI screening calls.
7. **Triggers** — the 15-minute cron and the "appeal created" trigger.
8. **Cutover** — re-register OAuth redirects, re-point the Lua game scripts, the Discord bot and the Staff Website, deploy, keep the Base44 app alive as a fallback for a few days, then move the domain.

---

## 9. Effort, cost and risks

- **Effort:** a full-stack rebuild measured in weeks of focused work. It is buildable by a competent developer (or an AI coding agent) given this document and the exported code — but not by the Base44 editor, which cannot build or run a non-Base44 app.
- **Cost:** Base44's subscription is replaced by database + hosting + storage + email + LLM usage (plus your time).
- **Risks:**
  - RLS mistakes leaking private data — IP addresses, staff notes, internal appeal notes are the sensitive fields. Test with multiple accounts.
  - File URIs inside records break unless the binaries are migrated.
  - Roblox, Google and GitHub OAuth apps need new redirect URIs; Discord and Sheets users must re-consent on the new connectors.
  - The game scripts and the Staff Website must move in lockstep with the `sync*` contract.
  - You lose the current published URL and every platform feature (preview, logs, secrets, credits).
- **Cheaper path:** stay on Base44. The app is already published and working here; a clean code copy is only needed when you want to read or edit the front end.

---

## 10. Handing this to another developer or AI agent

Give them this file plus the downloaded code, and point them at:

| Path | What's in it |
|---|---|
| `base44/entities/*.jsonc` | Every table definition **and its access rules** — the spec for section 4 |
| `base44/functions/*/entry.ts` | All 26 functions, complete logic — the spec for section 6 |
| `base44/workflows/*.jsonc` | The cron and entity triggers |
| `src/api/base44Client.js` | The client surface to reimplement (section 7) |
| `src/lib/AuthContext.jsx` | Every auth flow the front end expects |
| `src/render-server/*.lua`, `render-server/index.js` | The game-side callers that must be re-pointed |
| `STAFF_WEBSITE_AI_CONTEXT.md` | The current portal↔Staff Website API contract |