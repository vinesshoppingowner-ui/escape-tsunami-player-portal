# PROJECT_MAP.md — Complete AI Guide for ChatGPT, Gemini & Claude

> **Instructions for AI Assistants (ChatGPT, Gemini, Claude, Cursor, Copilot):**
> Read this file first whenever the user asks where to find something or wants to edit a feature. Every route, page, component, hook, utility, backend function, and database entity in this project is mapped below with its exact file path and purpose.

---

## 0. What to Tell ChatGPT / Gemini to Read First

When you open this project in VS Code and talk to ChatGPT, Gemini, Claude, or Cursor, **copy and paste this exact prompt** to get started:

> *"Read `PROJECT_MAP.md` and `src/site.config.js` first so you know how the whole website is structured. Then read the specific file we need to edit based on the map."*

### Which extra files to give the AI depending on your task:
- **Changing links, text, navbar, or footer:** Tell it to read `src/site.config.js` and `src/components/SiteNav.jsx`
- **Editing the Home page:** Tell it to read `src/pages/HomePage.jsx`
- **Editing the Member Portal:** Tell it to read `src/pages/MemberPortalPage.jsx` and `src/hooks/usePortalData.js`
- **Editing Applications (Applicant view):** Tell it to read `src/pages/ApplicationsDirectoryPage.jsx` and `src/pages/ApplicationFormPage.jsx`
- **Editing Application Builder / Reviewer (Staff view):** Tell it to read `src/pages/ManageApplicationsPage.jsx` and `src/components/admin/ApplicationsTab.jsx`
- **Editing Appeals & Appeal Chat:** Tell it to read `src/pages/MyAppealsPage.jsx` and `src/components/appeals/AppealChat.jsx`
- **Changing colors, fonts, or styles:** Tell it to read `src/index.css` and `tailwind.config.js`
- **Replacing the Base44 Backend / Database:** Tell it to read `src/api/base44Client.js`, `src/lib/AuthContext.jsx`, and the `base44/` folder

---

## 1. Quick-Find Cheat Sheet ("Where do I edit X?")

| What you want to change | Exact File Path |
| --- | --- |
| **Site name, tagline, navbar links, footer links, Roblox/Discord URLs** | `src/site.config.js` |
| **Page routes & URL paths** | `src/App.jsx` |
| **Global colors, fonts, seasonal themes, scrollbars, CSS animations** | `src/index.css` & `tailwind.config.js` |
| **Top navigation bar (desktop & mobile menu, emergency banners)** | `src/components/SiteNav.jsx` |
| **Logo & site brand text in the navbar** | `src/components/SiteBrand.jsx` |
| **Home / Landing page (`/`)** | `src/pages/HomePage.jsx` + `src/components/home/*` |
| **Member Portal dashboard (`/portal`)** | `src/pages/MemberPortalPage.jsx` + `src/components/portal/*` |
| **My Appeals page (`/my-appeals`) & live appeal chat** | `src/pages/MyAppealsPage.jsx` + `src/components/appeals/*` |
| **Open Applications list (`/applications`)** | `src/pages/ApplicationsDirectoryPage.jsx` |
| **Application Form / Question stepper (`/apply/:id`)** | `src/pages/ApplicationFormPage.jsx` + `src/components/apply/*` |
| **Staff/Owner Application Manager (`/manage-applications`)** | `src/pages/ManageApplicationsPage.jsx` + `src/components/admin/ApplicationsTab.jsx` |
| **Google Sheets auto-sync for applications** | `src/components/admin/applications/GoogleSheetSyncSettings.jsx` + `base44/functions/syncApplicationToSheet/entry.ts` |
| **Google Forms import modal** | `src/components/admin/applications/GoogleFormsSyncModal.jsx` + `base44/functions/googleFormsSync/entry.ts` |
| **Notification Center page (`/notifications`) & bell dropdown** | `src/pages/NotificationsPage.jsx` + `src/components/moderations/NotificationsBell.jsx` |
| **User profile dropdown & Settings modal (themes, glass, passcodes)** | `src/components/profile/ProfileMenu.jsx`, `AccountSwitcher.jsx`, `SettingsDialog.jsx` |
| **Staff vs. Member Portal destination chooser modal** | `src/components/StaffDestinationModal.jsx` |
| **Login, Register, Forgot/Reset Password pages** | `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` |

---

## 2. Pages & Routes (`src/pages/`)

All routes are registered in `src/App.jsx`:

| Route | Page File | Description |
| --- | --- | --- |
| `/` | `src/pages/HomePage.jsx` *(alias: `Home.jsx`)* | Public landing page with live Roblox stats, phone preview, features, how-to-play, FAQ, staff showcase, and Discord invite. |
| `/portal` | `src/pages/MemberPortalPage.jsx` *(alias: `Portal.jsx`)* | Main player dashboard with 6 tabs: Overview, Moderations, Appeals, Rewards, Security, and Support. Handles Roblox account verification if unlinked. |
| `/my-appeals` | `src/pages/MyAppealsPage.jsx` *(alias: `MyAppeals.jsx`)* | Dedicated page for viewing submitted appeals, appealing unlisted punishments, and chatting live with staff. |
| `/applications` | `src/pages/ApplicationsDirectoryPage.jsx` *(alias: `Applications.jsx`)* | Browse open staff/community applications and view past personal submissions & feedback. |
| `/apply/:id` | `src/pages/ApplicationFormPage.jsx` *(alias: `Apply.jsx`)* | Interactive application form supporting single-page or multi-step questions, conditional logic, draft autosave, file uploads, and AI review. |
| `/manage-applications` | `src/pages/ManageApplicationsPage.jsx` *(alias: `ManageApplications.jsx`)* | Staff & Owner dashboard to create/edit application forms, review submissions, sync with Google Forms/Sheets, and manage blacklists. |
| `/notifications` | `src/pages/NotificationsPage.jsx` *(alias: `Notifications.jsx`)* | Full notification center with unread filters, category tabs, and search. |
| `/roblox-callback` | `src/pages/RobloxOAuthCallbackPage.jsx` *(alias: `RobloxCallback.jsx`)* | Handles the OAuth redirect from Roblox when linking a player's Roblox account. |
| `/admin` | `src/pages/AdminDashboard.jsx` | Redirects authenticated admins to `/manage-applications`. |
| `/login` | `src/pages/Login.jsx` | Email/password, Google OAuth, and quick passcode login page. |
| `/register` | `src/pages/Register.jsx` | Account sign-up with email OTP verification. |
| `/forgot-password` | `src/pages/ForgotPassword.jsx` | Password reset request form. |
| `/reset-password` | `src/pages/ResetPassword.jsx` | New password submission using `?token=`. |

---

## 3. Frontend Components (`src/components/`)

### Top-Level App Shell & Guards (`src/components/`)
- `SiteNav.jsx` — Responsive top navigation bar, emergency alerts, site banners,announcements, and mobile slide-down menu.
- `SiteBrand.jsx` — Brand logo and title lockup linking to `/`.
- `StaffDestinationModal.jsx` — Mandatory modal for staff/owners on login to choose between the Member Portal or external Staff Website.
- `WelcomeModal.jsx` — First-time welcome modal shown after login/registration.
- `LandingRedirect.jsx` — Handles post-login landing redirects based on user preferences.
- `ProtectedRoute.jsx` — Auth wrapper that redirects signed-out visitors to `/login`.
- `IpBanCheck.jsx` & `BanOverlay.jsx` — Checks if a visitor's IP or account is banned and renders a restriction screen.
- `AccentApplier.jsx` — Applies user-chosen theme colors, corner styles, compact mode, and glass sliders to `<html>`.
- `BackgroundEffectLayer.jsx` & `SeasonalEffects.jsx` — Renders animated canvas backgrounds (stars, snow, rain, bubbles) and winter icicles/snowflakes.
- `ClickSound.jsx` — Optional subtle UI click sound effect.
- `AppLoadingScreen.jsx` — Initial loading spinner screen.

### Home Page Sections (`src/components/home/`)
- `FeaturesRow.jsx` — Highlights key game features on the landing page.
- `HowToPlay.jsx` — Step-by-step guide for new players.
- `SocialProof.jsx` & `CountUp.jsx` — Animated player stats and community metrics.
- `StaffSection.jsx` — Displays game developers and staff team cards.
- `HomeFAQ.jsx` — Accordion FAQ section on the landing page.
- `DiscordInviteSection.jsx` — Call-to-action card to join the Discord server.
- `StickyPlayButton.jsx` — Floating mobile "Play on Roblox" button.
- `HomeFooter.jsx` — Footer for the public home page.

### Member Portal & Tabs (`src/components/portal/`)
- `PortalTabNav.jsx` — Sidebar/top tab switcher for the 6 Member Portal tabs.
- `tabs/OverviewTab.jsx` — Account standing radial score card, security status, daily streak quest, and quick links.
- `tabs/ModerationsTab.jsx` — Full list of in-game warnings, mutes, kicks, and bans with evidence viewers.
- `tabs/AppealsTab.jsx` — Summary of submitted appeals inside the portal.
- `tabs/RewardsTab.jsx` — Daily login streak quests and Discord Devoted role claim.
- `tabs/SecurityTab.jsx` — Account security status and Roblox verification management.
- `tabs/SupportTab.jsx` — Bug report submission form and community support links.
- `DailyStreakQuest.jsx` — Tracks daily portal check-ins and unlocks rewards.
- `DiscordConnect.jsx` — Links Discord account and assigns the Devoted role.
- `PortalBugReports.jsx` — Form and history list for player-submitted bug reports.
- `GuestPreview.jsx` — Preview screen shown when a signed-out visitor opens `/portal`.
- `SecurityCard.jsx`, `GoodStandingTips.jsx`, `SupportCard.jsx`, `QuickLinks.jsx`, `PortalFooter.jsx`, `AppealDetailsModal.jsx`.

### Moderations & Verification (`src/components/moderations/`)
- `AccountStanding.jsx` — Radial Score Studio card calculating standing % from active moderations.
- `ModerationFeed.jsx` & `ModerationRow.jsx` — List and individual row for player moderation records.
- `AppealDialog.jsx` & `AppealField.jsx` — Modal form to submit an appeal for a specific moderation.
- `EvidenceDialog.jsx` & `SignedEvidenceImage.jsx` — Displays chat logs or private evidence screenshots attached to a punishment.
- `VerifyAccount.jsx` & `BioCodeVerify.jsx` — Links a player's Roblox account via OAuth or profile bio code.
- `RobloxAvatar.jsx` — Fetches and caches Roblox player headshots.
- `NotificationsBell.jsx` — Top-bar notification bell popover with real-time updates.

### Appeals & Live Chat (`src/components/appeals/`)
- `AppealChat.jsx` — Real-time chat thread between the appealing player and staff, with typing indicators.
- `AppealChatMessage.jsx`, `AppealChatInput.jsx`, `AppealChatControls.jsx` — Message bubbles, input bar, and attachment controls.
- `ChatImage.jsx` & `VideoAttachment.jsx` — Renders private image uploads and embedded video clips (YouTube, Medal.tv) in chat.
- `UnlistedAppealDialog.jsx` — Form to appeal a punishment that isn't listed in the database.

### Applicant Form Components (`src/components/apply/`)
- `ApplyIntro.jsx` — Welcome screen before starting an application (shows question count, requirements, and draft status).
- `ApplyStepper.jsx` — Progress bar and question step jumper.
- `ApplyField.jsx` — Renders the input for each question type (short text, paragraph, multiple choice, checkboxes, dropdown, scale, date, file upload, Roblox user, Discord user, YouTube video).
- `ApplyReview.jsx` — Final review screen before submitting an application.
- `ApplyStatusScreen.jsx` — Shown when an application is submitted, closed, on cooldown, or restricted.
- `ApplyLogin.jsx`, `ApplyRegister.jsx`, `ApplyForgot.jsx` — Embedded auth screens when an unauthenticated user opens an application link.
- `FileUploadField.jsx` & `UploadedFileAttachment.jsx` — Drag-and-drop private file uploader and previewer.
- `SubmissionDetailModal.jsx` — Allows applicants to view their past submitted answers and staff feedback.
- `AppIcon.jsx` — Renders either a Lucide icon (`lucide:Name`) or an emoji for an application.

### Profile & User Settings (`src/components/profile/`)
- `SettingsDialog.jsx` — All-in-one user settings & preferences modal (Appearance, Theme Colors, Backgrounds, Glass Slider, Display, Account & Profile, Navigation, Quick Login Passcode, Notifications, and Privacy — all consolidated in this single file).
- `ProfileMenu.jsx` & `AccountSwitcher.jsx` — Top-right user avatar button and dropdown menu.
- `PasscodeKeypad.jsx` — 4-digit PIN keypad component used by `Login.jsx` and `SettingsDialog.jsx`.
- `UserAvatar.jsx` — Displays custom uploaded avatar, Roblox headshot, or initials.

### Application Management & Admin Components (`src/components/admin/`)
- `ApplicationsTab.jsx` — Main dashboard for creating, filtering, and managing applications and viewing submission counts.
- `applications/ApplicationEditor.jsx` — Modal builder to edit application questions (`QuestionEditor.jsx`), basic info (`ApplicationBasicSettings.jsx`), rules (`ApplicationFormSettings.jsx`), and advanced settings (`ApplicationAdvancedSettings.jsx`).
- `applications/ResponsesBoard.jsx`, `ResponseViewer.jsx`, `ResponseDecisionPanel.jsx`, `ResponseAnswers.jsx`, `ResponseAIPanel.jsx` — Full interface for staff to read submissions, view AI scores, rate applicants, and accept/reject with feedback.
- `applications/GoogleSheetSyncSettings.jsx` — Owner modal to configure automatic Google Sheets syncing for all application submissions and status updates.
- `applications/GoogleFormsSyncModal.jsx` — Imports questions from a public or OAuth-connected Google Form.
- `applications/ApplicationSyncModal.jsx` — Cross-portal application sync tool.
- `applications/ApplicationBlacklistPanel.jsx` — Manage users blocked from submitting applications.
- *(Note: `src/components/admin/` and `src/components/analytics/` also contain legacy moderation/appeals/watchlist/livechat admin tabs preserved for reference or future re-enabling).*

---

## 4. Hooks (`src/hooks/`) & Utilities (`src/lib/`)

### Custom Hooks (`src/hooks/`)
- `usePortalData.js` — Loads and refreshes the current player's moderations, appeals, verification state, and site lock status.
- `useLiveApplications.js` — Real-time subscription hook for application counts and new submission badges.
- `useUserNotifications.js` — Fetches and subscribes to real-time player notifications.
- `useAppealMessages.js` & `useAppealPresence.js` — Real-time chat messages and typing indicators for appeals.
- `useGameStats.js` — Fetches live Roblox concurrent players, visits, likes, and favorites.
- `useSeasonalTheme.js` — Detects or applies seasonal themes (e.g., Winter edition).
- `useDesktopApp.js` — Detects if running inside the desktop wrapper.

### Core Libraries (`src/lib/`)
- `AuthContext.jsx` — Global authentication provider (`useAuth()`).
- `isOwner.js` & `adminRole.js` — Helper functions to check if a user is the site Owner (`isOwner(user)`), Admin, or Staff.
- `userPrefs.js` — Reads and persists user visual preferences (theme color, glass transparency, compact mode, sound).
- `applicationTypes.js` — Defines all question types, icons, and answer formatting for applications.
- `formLogic.js` — Evaluates conditional question visibility (`evalShowIf`) and field validation (`validateField`).
- `applicationRetake.js` — Calculates whether a user can retake an application (cooldowns, max attempts, staff retake grants).
- `applicationAI.js` — Runs AI evaluation on submitted applications (score 0–100, summary, strengths, flags).
- `appIcons.js` — Registry of Lucide icons available in the application editor.

---

## 5. Backend Functions (`base44/functions/`)

Each folder under `base44/functions/<functionName>/entry.ts` is a Deno serverless endpoint invoked via `base44.functions.invoke('<functionName>', payload)`:

- `submitApplication/entry.ts` — Validates eligibility/cooldowns/blacklists, saves a new `ApplicationResponse`, sends Discord alerts, and triggers Google Sheet sync.
- `syncApplicationToSheet/entry.ts` — Appends new application submissions to the owner's Google Sheet and updates the row in-place when staff change the status.
- `googleFormsSync/entry.ts` — Imports questions and settings from a Google Form URL or connected Google account.
- `syncApplications/entry.ts` — Synchronizes applications and responses across portals.
- `robloxOAuth/entry.ts` & `robloxBioVerify/entry.ts` & `robloxLookup/entry.ts` — Handles Roblox account verification and profile lookups.
- `getDiscordProfile/entry.ts`, `discordSend/entry.ts`, `assign-devoted-role/entry.ts` — Discord OAuth profile lookup, webhook notifications, and Devoted role assignment.
- `submit-game-logs/entry.ts`, `checkPlayerBan/entry.ts`, `getPlayerWarnings/entry.ts`, `gameSessions/entry.ts` — Endpoints called by the Roblox game servers.
- `syncModeration/entry.ts`, `syncAppealMessages/entry.ts`, `syncBugReports/entry.ts` — Cross-portal synchronization endpoints.
- `expireTempBans/entry.ts` & `autoAssignAppeal/entry.ts` — Automated workflow functions for expiring temporary bans and assigning appeals.

---

## 6. Database Entities (`base44/entities/*.jsonc`)

- `Application.jsonc` — Application form definitions (title, slug, questions JSON, settings JSON, status).
- `ApplicationResponse.jsonc` — Submitted applications (applicant username/email, answers JSON, status, AI review, staff rating/feedback).
- `ApplicationBlacklist.jsonc` — Users restricted from submitting applications.
- `Moderation.jsonc` — In-game punishments (Warning, Mute, Kick, Temporary Ban, Permanent Ban) and evidence.
- `Appeal.jsonc` & `AppealMessage.jsonc` & `AppealPresence.jsonc` — Player appeals and real-time appeal chat threads.
- `Notification.jsonc` — In-app notifications sent to players.
- `BugReport.jsonc` — Player-submitted bug reports.
- `UserStreak.jsonc` — Daily login streak progress for rewards.
- `SiteSettings.jsonc` — Global site toggles (maintenance mode, banners, portal lock, Google Sheet sync settings).
- `Announcement.jsonc` — Site-wide announcements displayed in the top banner.

---

## 7. Files You Can Remove or Replace After Leaving Base44

Once this website is no longer hosted on Base44 (after October 21st), here is the exact breakdown of what you can delete or replace:

### A. Base44-Specific Platform Files (Replace or Delete When Moving to Your Own Backend/Hosting)
1. **`base44/config.jsonc` & `base44/connectors/`** — Base44 platform configuration files. Safe to delete once off Base44.
2. **`base44/workflows/`** — Base44 workflow JSON files (`Auto Assign Appeals.jsonc`, `Auto Expire Temp Bans.jsonc`). Move these cron schedules to your new backend (e.g., Supabase, Firebase, Node/Express, or Render).
3. **`base44/entities/*.jsonc`** — Keep these briefly so ChatGPT/Gemini can convert them into SQL/Supabase/MongoDB tables for your new database, then delete them.
4. **`base44/functions/*/entry.ts`** — Deno serverless functions using `npm:@base44/sdk`. Ask ChatGPT/Gemini to convert the ones you still need into standard Node.js/Express or Supabase Edge Functions, then delete the `base44/` folder.
5. **`src/api/base44Client.js` & `src/lib/app-params.js`** — Initializes `@base44/sdk`. Replace `src/api/base44Client.js` with your new backend client (or a compatibility wrapper so you don't have to rewrite every `base44.entities.*` call across the frontend!).
6. **`vite.config.js` & `package.json`** — Remove `@base44/vite-plugin` from `vite.config.js` and uninstall `@base44/sdk` + `@base44/vite-plugin` from `package.json` once `src/api/base44Client.js` is replaced.

### B. Legacy Page Re-Export Shims (Safe to Delete Anytime)
These 8 tiny 1-line files only exist as backwards-compatible redirects to the renamed `*Page.jsx` files:
- `src/pages/Home.jsx`
- `src/pages/Portal.jsx`
- `src/pages/MyAppeals.jsx`
- `src/pages/Applications.jsx`
- `src/pages/Apply.jsx`
- `src/pages/ManageApplications.jsx`
- `src/pages/Notifications.jsx`
- `src/pages/RobloxCallback.jsx`

### C. Unused / Disconnected Frontend Files (140 Files — Safe to Delete if You Don't Plan to Re-Enable Them Here)
Because staff moderation tools moved to your separate Staff Website, the following files are **not imported by any active page** in `src/App.jsx` and can be deleted to shrink the repo:
- **Unused Pages:**
  - `src/pages/BugReports.jsx`
  - `src/pages/OAuthConsent.jsx`
- **Old Admin Dashboard Tabs & Panels (everything in `src/components/admin/` EXCEPT `ApplicationsTab.jsx` and `src/components/admin/applications/*`):**
  - `src/components/admin/AdminMoreMenu.jsx`, `AdminOverview.jsx`, `AppealAISummary.jsx`, `AppealReviewModal.jsx`, `AppealsTab.jsx`, `BloxlinkLookup.jsx`, `DashboardTab.jsx`, `DeleteAccountButton.jsx`, `KnowledgeBaseTab.jsx`, `LiveChatTab.jsx`, `ModerationsTab.jsx`, `MusicTab.jsx`, `QuickPunishButton.jsx`, `StaffLogsTab.jsx`, `UserInfoModal.jsx`, `UserLookup.jsx`, `UserLookupAppeals.jsx`, `UsersTab.jsx`, `WebsiteBansTab.jsx`
  - Entire folders: `src/components/admin/appeals/`, `src/components/admin/dashboard/`, `src/components/admin/discord/`, `src/components/admin/evasion/`, `src/components/admin/livechat/`, `src/components/admin/messaging/`, `src/components/admin/moderations/`, `src/components/admin/performance/`, `src/components/admin/players/`, `src/components/admin/portal/`, `src/components/admin/reports/`, `src/components/admin/stafflogs/`, `src/components/admin/users/`, `src/components/admin/watchlist/`
- **Unused Analytics Folder:**
  - Entire folder: `src/components/analytics/` (12 files)
- **Other Unreferenced Components & Helpers:**
  - `src/components/SectionLabel.jsx`
  - `src/components/bugreports/BugReportCard.jsx`, `src/components/bugreports/BugReportStats.jsx`
  - `src/components/home/LatestUpdates.jsx`
  - `src/components/moderations/AdminVerifyButton.jsx`, `src/components/moderations/DevSandbox.jsx`, `src/components/moderations/ModerationCard.jsx`
  - `src/components/portal/PatchNotes.jsx`
  - `src/hooks/use-mobile.jsx`, `src/hooks/useLiveChatLogs.js`
  - `src/lib/appealDecision.js`, `src/lib/appealSla.js`, `src/lib/discordWebhook.js`, `src/lib/escalation.js`, `src/lib/evasionDetect.js`, `src/lib/messageAudience.js`, `src/lib/moderationBulk.js`, `src/lib/moderationEmails.js`, `src/lib/renderBridge.js`, `src/lib/responseTemplates.js`, `src/lib/staffLog.js`, `src/lib/staffPermissions.js`, `src/lib/staffStats.js`, `src/lib/staffUndo.js`, `src/lib/userLookup.js`
- **External Roblox / Render Server Scripts (if managed in a separate repo):**
  - `scripts/chrome-profile-cleaner.ps1`
  - `render-server/` and `src/render-server/` (Lua scripts & Discord poller)