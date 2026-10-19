// ============================================================
//  ESCAPE TSUNAMI PORTAL — MASTER CONFIG
// ============================================================
//  This single file controls branding, navigation, external
//  links, footer content, and theme defaults across EVERY page.
//
//  Edit a value below and every page updates automatically.
//  For deeper visual changes (CSS colors, fonts, animations,
//  seasonal effects) edit  src/index.css  and  tailwind.config.js
// ============================================================

import {
  Home, LogIn, Scale, FileText,
  MessageCircle, BookOpen, Bug,
  Waves,
} from 'lucide-react';

export const SITE_CONFIG = {

  // ── BRANDING ─────────────────────────────────────────────
  // Shown in the top-left logo on every page.
  brand: {
    name: 'Escape Tsunami',
    subtitle: 'For Developers',
    logoIcon: Waves,
  },

  // ── NAVIGATION ───────────────────────────────────────────
  // Desktop top-bar links and mobile slide-down menu links.
  // icon = any lucide-react icon component.
  nav: {
    directLinks: [
      { label: 'Home',         to: '/',             icon: Home },
      { label: 'Portal',       to: '/portal',        icon: LogIn },
      { label: 'My Appeals',   to: '/my-appeals',    icon: Scale },
      { label: 'Applications', to: '/applications',  icon: FileText },
    ],
    mobileLinks: [
      { label: 'Home',          to: '/',             icon: Home },
      { label: 'Member Portal', to: '/portal',        icon: LogIn },
      { label: 'My Appeals',    to: '/my-appeals',    icon: Scale },
      { label: 'Applications',  to: '/applications',  icon: FileText },
    ],
  },

  // ── EXTERNAL LINKS ───────────────────────────────────────
  links: {
    robloxGame: 'https://www.roblox.com/games/103398581793479/Escape-Tsunami-For-Developers',
    discord:    'https://discord.gg/NCBqfpwPuT',
  },

  // ── FOOTER ──────────────────────────────────────────────
  // Links shown at the bottom of portal pages.
  // external: true  → opens href in a new tab
  // external: false → uses internal router (to)
  footer: {
    links: [
      { label: 'Join Discord',          href: 'https://discord.gg/NCBqfpwPuT', icon: MessageCircle, external: true },
      { label: 'Community Guidelines', href: 'https://discord.gg/NCBqfpwPuT', icon: BookOpen,      external: true },
      { label: 'Report a Bug',          to:   '/bug-reports',                  icon: Bug,           external: false },
    ],
    copyright: 'Escape Tsunami for Developers Player Portal',
  },

  // ── THEME DEFAULTS ──────────────────────────────────────
  // Reference values for the visual theme. Per-user accent and
  // display preferences are stored in userPrefs and override these.
  // Accent options: cyan | violet | emerald | rose | amber
  theme: {
    defaultAccent: 'cyan',
    availableAccents: ['cyan', 'violet', 'emerald', 'rose', 'amber'],
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    displayFont: 'Outfit',
    seasonalEnabled: true,
  },
};

export default SITE_CONFIG;