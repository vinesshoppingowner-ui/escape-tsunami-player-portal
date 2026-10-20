# Escape Tsunami Player Portal

Official player portal and application system for **Escape Tsunami For Developers** on Roblox.

> **Using ChatGPT, Gemini, Claude, or Cursor in VS Code?**
> Tell your AI:
> **`"Read PROJECT_MAP.md and src/site.config.js first"`**
>
> [`PROJECT_MAP.md`](./PROJECT_MAP.md) contains:
> 1. **Exact prompts & which files to tell ChatGPT/Gemini to read** for every task (Section 0)
> 2. **A "Where do I edit X?" cheat sheet** for every page, component, and backend function (Sections 1–6)
> 3. **A complete list of Base44 files & 140 unused files you can safely delete/replace** after moving off Base44 (Section 7)

---

## Quick File Guide

| Feature | Where to Edit |
| --- | --- |
| **Branding, Navbar & Footer Links** | `src/site.config.js` |
| **URL Routes** | `src/App.jsx` |
| **Home Page (`/`)** | `src/pages/HomePage.jsx` & `src/components/home/` |
| **Member Portal (`/portal`)** | `src/pages/MemberPortalPage.jsx` & `src/components/portal/` |
| **My Appeals (`/my-appeals`)** | `src/pages/MyAppealsPage.jsx` & `src/components/appeals/` |
| **Open Applications (`/applications`)** | `src/pages/ApplicationsDirectoryPage.jsx` |
| **Application Form (`/apply/:id`)** | `src/pages/ApplicationFormPage.jsx` & `src/components/apply/` |
| **Manage Applications (`/manage-applications`)** | `src/pages/ManageApplicationsPage.jsx` & `src/components/admin/` |
| **Notifications (`/notifications`)** | `src/pages/NotificationsPage.jsx` |
| **Profile & Settings Modal** | `src/components/profile/` |
| **Backend Functions** | `base44/functions/` |
| **Database Schemas** | `base44/entities/` |

*(See [`PROJECT_MAP.md`](./PROJECT_MAP.md) for the full file-by-file breakdown.)*

---

## Running Locally in VS Code

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
To run the full local development environment (frontend + backend functions) with the Base44 CLI:
```bash
npm install -g base44@latest
base44 dev
```

Or to run just the Vite frontend against your hosted Base44 backend:
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
`