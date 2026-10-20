# AGENTS.md

## Start Here (For ChatGPT, Gemini, Claude, Cursor & Copilot)

**Always read [`PROJECT_MAP.md`](./PROJECT_MAP.md) first!**
It contains a complete "Where do I edit X?" cheat sheet and maps every route, page, component, hook, backend function, and database entity in this repository.

## Project Overview

**Escape Tsunami Player Portal** is a React + Tailwind CSS + Vite web application powered by the Base44 backend-as-a-service SDK (`@/api/base44Client`).

### Key Entry Points
- `PROJECT_MAP.md`: Complete directory & file guide for AI assistants.
- `src/site.config.js`: Master configuration file for site branding, navigation links, and footer links.
- `src/App.jsx`: Application router mapping URLs to page components in `src/pages/`.
- `src/index.css` & `tailwind.config.js`: Global styles, design tokens, and seasonal themes.
- `src/api/base44Client.js`: Pre-initialized Base44 SDK client (`base44.entities.*`, `base44.auth.*`, `base44.functions.invoke(...)`).

### Main Page Files (`src/pages/`)
- `HomePage.jsx` (`/`) — Public landing page & live Roblox game stats
- `MemberPortalPage.jsx` (`/portal`) — Player dashboard (Overview, Moderations, Appeals, Rewards, Security, Support)
- `MyAppealsPage.jsx` (`/my-appeals`) — Player appeal tracker & live staff chat
- `ApplicationsDirectoryPage.jsx` (`/applications`) — Open applications list & user submission history
- `ApplicationFormPage.jsx` (`/apply/:id`) — Interactive application form & question stepper
- `ManageApplicationsPage.jsx` (`/manage-applications`) — Staff & Owner application builder, reviewer, and Google Sheets/Forms sync
- `NotificationsPage.jsx` (`/notifications`) — Player notification center
- `RobloxOAuthCallbackPage.jsx` (`/roblox-callback`) — Roblox OAuth verification callback
- `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` — Authentication flows

## Local Development in VS Code

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local dev server:
   ```bash
   npm run dev
   ```
   *(Or run `base44 dev` if using the Base44 CLI for local backend functions).*
3. Verify the production build compiles cleanly after making edits:
   ```bash
   npm run build
   ```

## Coding Conventions for AI Assistants
- Use the `@/` import alias for all imports inside `src/` (e.g., `import SiteNav from '@/components/SiteNav'`).
- Icons come from `lucide-react`. Verify an icon exists before importing it.
- Keep components modular and focused.
- Legacy re-export shims (`Home.jsx`, `Portal.jsx`, `Apply.jsx`, etc.) exist in `src/pages/` for backwards compatibility, but always edit the descriptive `*Page.jsx` files directly.