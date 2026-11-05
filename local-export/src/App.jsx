import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Bell, Bug, Calendar, Check, CheckCircle2, ChevronDown, Clock,
  Eye, EyeOff, FileText, Gavel, Home as HomeIcon, Loader2, Lock, LogOut, Mail,
  Menu, Plus, Search, Settings, Shield, Trash2, User, Users, X,
} from "lucide-react";
import { auth, db, hasSupabase } from "./supabase";

/* ============================== helpers ============================== */

const cx = (...parts) => parts.filter(Boolean).join(" ");
const MOD_TYPES = ["Warning", "Mute", "Kick", "Temporary Ban", "Permanent Ban"];
const MOD_STATUS = ["Active", "Expired", "Repealed"];
const BUG_SEVERITY = ["Low", "Medium", "High", "Critical"];

const TONES = {
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  slate: "border-white/10 bg-white/5 text-slate-300",
};

const INPUT =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/25";

const typeTone = (t) =>
  ["Permanent Ban", "Temporary Ban", "Kick"].includes(t) ? "rose" : t === "Mute" ? "amber" : "cyan";

const statusTone = (s) => {
  if (["Active", "Pending", "submitted"].includes(s)) return "amber";
  if (["Approved", "accepted", "Confirmed"].includes(s)) return "emerald";
  if (["Denied", "rejected", "Declined"].includes(s)) return "rose";
  if (["Under Review", "under_review"].includes(s)) return "violet";
  return "slate";
};

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const parseQuestions = (raw) => {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* use defaults */
  }
  return [
    { id: "q1", label: "Tell us about yourself", type: "long" },
    { id: "q2", label: "Why are you interested in this role?", type: "long" },
  ];
};

const parseAnswers = (raw) => {
  try {
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const isStaffRole = (user) => Boolean(user) && ["admin", "staff", "owner"].includes(user.role);

/* ============================== context ============================== */

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function ToastHost({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className={cx(
          "toast-in pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur",
          t.type === "error" ? "border-rose-500/30 bg-rose-500/15 text-rose-100" : "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
        )}>
          {t.type === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    let alive = true;
    auth.getSession().then((u) => {
      if (!alive) return;
      setUser(u);
      setReady(true);
    });
    const off = auth.onChange((u) => alive && setUser(u));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const value = useMemo(() => ({
    user, ready, toast, setUser,
    refreshUser: async () => {
      const next = await auth.getSession();
      setUser(next);
      return next;
    },
  }), [user, ready, toast]);

  return (
    <AppCtx.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} />
    </AppCtx.Provider>
  );
}

/* ============================== primitives ============================== */

function Btn({ as: Tag = "button", variant = "primary", size = "md", className, children, ...rest }) {
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-[0_6px_20px_-6px_rgba(34,211,238,0.6)]",
    ghost: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
    danger: "border border-rose-500/30 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
    success: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25",
    subtle: "text-slate-300 hover:bg-white/5 hover:text-white",
  };
  const sizes = { sm: "h-8 gap-1.5 px-3 text-xs", md: "h-10 gap-2 px-4 text-sm", lg: "h-11 gap-2 px-5 text-sm" };
  return (
    <Tag className={cx("inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60", variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Tag>
  );
}

const Card = ({ className, children }) => (
  <div className={cx("rounded-2xl border border-white/[0.07] bg-[#0f1523] p-5", className)}>{children}</div>
);

const Badge = ({ tone = "slate", className, children }) => (
  <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", TONES[tone] || TONES.slate, className)}>
    {children}
  </span>
);

const Field = ({ label, hint, className, children }) => (
  <label className={cx("block", className)}>
    <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
  </label>
);

function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#05070d]/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx("page-in my-auto w-full rounded-2xl border border-white/10 bg-[#0f1523] shadow-2xl", wide ? "max-w-2xl" : "max-w-lg")}>
        <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-white/5 p-4">{footer}</div>}
      </div>
    </div>
  );
}

const Loading = ({ label = "Loading" }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
    <Loader2 className="h-4 w-4 animate-spin" /> {label}…
  </div>
);

function Empty({ icon: Icon = FileText, title, body, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ============================== routing ============================== */

const go = (path) => {
  window.location.hash = path;
  window.scrollTo({ top: 0 });
};

function useRoute() {
  const [path, setPath] = useState(() => window.location.hash.replace(/^#/, "") || "/");
  useEffect(() => {
    const onHash = () => {
      setPath(window.location.hash.replace(/^#/, "") || "/");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return path;
}

/* ============================== nav + footer ============================== */

const NAV_LINKS = [
  { label: "Home", path: "/", icon: HomeIcon },
  { label: "Portal", path: "/portal", icon: Shield },
  { label: "Applications", path: "/applications", icon: FileText },
];

function Brand() {
  return (
    <a href="#/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
        <Shield className="h-[18px] w-[18px] text-cyan-300" />
      </span>
      <span className="leading-none">
        <span className="block text-sm font-bold tracking-tight text-white">ESCAPE TSUNAMI</span>
        <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">Player Portal</span>
      </span>
    </a>
  );
}

function Nav() {
  const { user } = useApp();
  const path = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [path]);

  const links = isStaffRole(user) ? [...NAV_LINKS, { label: "Admin", path: "/admin", icon: Users }] : NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090c18]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-5 md:h-16">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a key={link.path} href={`#${link.path}`} className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              path === link.path ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}>
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30 text-[11px] font-bold text-cyan-200">
                  {(user.full_name || "M").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[110px] truncate">{user.full_name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0f1523] p-1 shadow-2xl">
                  <div className="px-3 py-2">
                    <p className="truncate text-xs font-semibold text-white">{user.full_name}</p>
                    <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                    {user.roblox_username && <p className="mt-1 truncate text-[11px] text-cyan-300">@{user.roblox_username}</p>}
                  </div>
                  <div className="my-1 h-px bg-white/5" />
                  <a href="#/portal" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white">
                    <Shield className="h-3.5 w-3.5" /> Member Portal
                  </a>
                  <a href="#/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white">
                    <Settings className="h-3.5 w-3.5" /> Account settings
                  </a>
                  <button type="button" onClick={() => { auth.signOut(); window.location.hash = "/"; }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-300 hover:bg-rose-500/10">
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Btn as="a" href="#/login" variant="ghost" size="sm">Sign in</Btn>
              <Btn as="a" href="#/register" size="sm">Create account</Btn>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {!user && <a href="#/login" className="px-2 py-1.5 text-sm font-medium text-cyan-300">Sign in</a>}
          <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu"
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/5">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cx("overflow-hidden border-t border-white/[0.06] bg-[#0b0f1a] transition-all duration-300 md:hidden", menuOpen ? "max-h-[440px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="space-y-1 px-4 py-3">
          {links.map((link) => (
            <a key={link.path} href={`#${link.path}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-slate-300 hover:bg-white/5 hover:text-white">
              <link.icon className="h-4 w-4 text-cyan-400/70" />
              {link.label}
            </a>
          ))}
          {user ? (
            <>
              <a href="#/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-slate-300 hover:bg-white/5 hover:text-white">
                <Settings className="h-4 w-4 text-cyan-400/70" /> Settings
              </a>
              <button type="button" onClick={() => { auth.signOut(); window.location.hash = "/"; }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-rose-300 hover:bg-rose-500/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <a href="#/register" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-3 text-[15px] font-semibold text-white">
              Create account
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-cyan-500/70" />
          <span>Escape Tsunami — Player Portal</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#/applications" className="hover:text-slate-300">Applications</a>
          <a href="#/portal" className="hover:text-slate-300">Member Portal</a>
          <span className={cx("inline-flex items-center gap-1.5", hasSupabase ? "text-emerald-400/80" : "text-amber-400/80")}>
            <span className={cx("h-1.5 w-1.5 rounded-full", hasSupabase ? "bg-emerald-400" : "bg-amber-400")} />
            {hasSupabase ? "Supabase connected" : "Local mode — data saved in this browser"}
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ============================== home ============================== */

const HOME_STATS = [
  { label: "Active members", value: "12,400+" },
  { label: "Appeals reviewed", value: "3,180" },
  { label: "Average review time", value: "18 hrs" },
  { label: "Community rating", value: "96%" },
];

const HOME_FEATURES = [
  { icon: Shield, title: "Full moderation history", body: "Every warning, mute, kick and ban issued to your account, with the reason, duration and the staff member who issued it." },
  { icon: Gavel, title: "Structured appeals", body: "Dispute a punishment with a guided form. Staff decisions, responses and timelines are recorded in one place." },
  { icon: FileText, title: "Applications in one place", body: "Browse open roles, apply, and track the review status of every submission you have sent in." },
];

const SAMPLE_ROWS = [
  { type: "Warning", reason: "Minor chat violation", tone: "amber", when: "Mar 2, 2026" },
  { type: "Kick", reason: "AFK farming", tone: "rose", when: "Jan 18, 2026" },
  { type: "Mute", reason: "Spam", tone: "amber", when: "Dec 9, 2025" },
];

function HomePage() {
  const { user } = useApp();

  return (
    <main className="page-in">
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Portal online
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Your record.<br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">Your appeal.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
              The official member portal for Escape Tsunami. Check exactly why you were moderated, submit an appeal,
              and track every application you send to the team.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Btn as="a" href={user ? "#/portal" : "#/register"} size="lg">
                {user ? "Open my portal" : "Create free account"} <ArrowRight className="h-4 w-4" />
              </Btn>
              <Btn as="a" href={user ? "#/applications" : "#/login"} variant="ghost" size="lg">
                {user ? "Browse applications" : "I already have an account"}
              </Btn>
            </div>
          </div>

          <Card className="relative overflow-hidden border-white/[0.08] bg-gradient-to-br from-[#111a2c] to-[#0b101c]">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-500/15 blur-[70px]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Account standing</p>
                <Badge tone="emerald"><CheckCircle2 className="h-3 w-3" /> Good</Badge>
              </div>
              <p className="text-2xl font-bold text-white">No active punishments</p>
              <p className="mt-1 text-xs text-slate-400">Your account is in good standing across all Escape Tsunami servers.</p>

              <div className="mt-5 space-y-2">
                {SAMPLE_ROWS.map((row) => (
                  <div key={row.reason} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{row.reason}</p>
                      <p className="text-[11px] text-slate-500">{row.when}</p>
                    </div>
                    <Badge tone={row.tone}>{row.type}</Badge>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] text-slate-500">Sample preview — sign in to see your real history.</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {HOME_STATS.map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Everything in one place</h2>
        <p className="mt-1 text-sm text-slate-400">Built so you never have to ask a staff member what happened to your account again.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {HOME_FEATURES.map((feature) => (
            <Card key={feature.title}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                <feature.icon className="h-5 w-5 text-cyan-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{feature.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <Card className="flex flex-col items-start gap-5 border-violet-500/20 bg-gradient-to-br from-[#141026] to-[#0b101c] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Want to join the team?</h2>
            <p className="mt-1 text-xs text-slate-400">Open roles are listed in the applications directory. Decisions arrive in your portal inbox.</p>
          </div>
          <Btn as="a" href="#/applications" variant="ghost">
            View open applications <ArrowRight className="h-4 w-4" />
          </Btn>
        </Card>
      </section>
    </main>
  );
}

/* ============================== auth ============================== */

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="page-in relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-5 py-14">
      <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />
      <div className="relative">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10">
            <Lock className="h-5 w-5 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <Card className="border-white/[0.08]">{children}</Card>
        {footer && <div className="mt-5 text-center text-xs text-slate-400">{footer}</div>}
      </div>
    </main>
  );
}

function PasswordInput({ value, onChange, autoComplete = "current-password" }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder="••••••••"
        autoComplete={autoComplete} className={cx(INPUT, "pl-9 pr-10")} required />
      <button type="button" tabIndex={-1} onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-300">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const ErrorBox = ({ message }) =>
  message ? (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
      <span>{message}</span>
    </div>
  ) : null;

function LoginPage({ redirect }) {
  const { setUser, toast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await auth.signIn(email, password);
      setUser(user);
      toast(`Welcome back, ${user.full_name}`);
      go(redirect || "/portal");
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to check your standing and appeals"
      footer={<>No account yet? <a href="#/register" className="font-semibold text-cyan-400 hover:text-cyan-300">Create one</a></>}>
      <ErrorBox message={error} />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              autoComplete="email" className={cx(INPUT, "pl-9")} required />
          </div>
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Btn type="submit" disabled={loading} className="h-11 w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </Btn>
      </form>
    </AuthShell>
  );
}

function RegisterPage() {
  const { setUser, toast } = useApp();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await auth.signUp(form.email, form.password, form.full_name);
      setUser(user);
      toast("Account created — add your Roblox username next.");
      go("/settings");
    } catch (err) {
      setError(err.message || "Could not create your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Free, takes less than a minute"
      footer={<>Already registered? <a href="#/login" className="font-semibold text-cyan-400 hover:text-cyan-300">Sign in</a></>}>
      <ErrorBox message={error} />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Display name">
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={form.full_name} onChange={update("full_name")} placeholder="Alex" className={cx(INPUT, "pl-9")} required />
          </div>
        </Field>
        <Field label="Email address">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com"
              autoComplete="email" className={cx(INPUT, "pl-9")} required />
          </div>
        </Field>
        <Field label="Password" hint="At least 6 characters">
          <PasswordInput value={form.password} onChange={update("password")} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password">
          <PasswordInput value={form.confirm} onChange={update("confirm")} autoComplete="new-password" />
        </Field>
        <Btn type="submit" disabled={loading} className="h-11 w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </Btn>
      </form>
    </AuthShell>
  );
}

/* ============================== portal ============================== */

const StatCard = ({ label, value, tone = "cyan", icon: Icon }) => (
  <Card className="flex items-center gap-3 p-4">
    <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", TONES[tone])}>
      {Icon && <Icon className="h-4 w-4" />}
    </span>
    <div>
      <p className="text-xl font-bold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  </Card>
);

function AppealDialog({ open, onClose, moderation, onSubmit, busy }) {
  const [form, setForm] = useState({ appeal_reason: "", why_accepted: "", deserved_infraction: "" });

  useEffect(() => {
    if (open) setForm({ appeal_reason: "", why_accepted: "", deserved_infraction: "" });
  }, [open]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} wide title="Submit an appeal"
      subtitle={moderation ? `${moderation.moderation_type} · ${moderation.reason}` : "Punishment not listed in your history"}
      footer={
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn disabled={busy || !form.appeal_reason.trim()} onClick={() => onSubmit(form)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />} Submit appeal
          </Btn>
        </div>
      }>
      <div className="space-y-4">
        <Field label="What happened?" hint="Explain the situation in your own words.">
          <textarea value={form.appeal_reason} onChange={update("appeal_reason")} rows={4} className={INPUT} required
            placeholder="Describe what you were doing when you were punished…" />
        </Field>
        <Field label="Why should your appeal be accepted?">
          <textarea value={form.why_accepted} onChange={update("why_accepted")} rows={3} className={INPUT}
            placeholder="Any evidence, context or proof that changes the picture…" />
        </Field>
        <Field label="Did you deserve this infraction, in your opinion?">
          <select value={form.deserved_infraction} onChange={update("deserved_infraction")} className={INPUT}>
            <option value="">Select an answer…</option>
            <option value="No, I did nothing wrong">No, I did nothing wrong</option>
            <option value="Partly, but the punishment was too harsh">Partly, but the punishment was too harsh</option>
            <option value="Yes, but I have changed">Yes, but I have changed</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

function ModerationList({ moderations, loading, onAppeal, appealedIds }) {
  if (loading) return <Loading label="Loading your history" />;
  if (!moderations.length) {
    return <Empty icon={Shield} title="No moderation on record" body="Nothing has been issued to your account. Keep it that way." />;
  }

  return (
    <div className="space-y-3">
      {moderations.map((row) => {
        const already = appealedIds.has(row.id);
        return (
          <Card key={row.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={typeTone(row.moderation_type)}>{row.moderation_type}</Badge>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  {row.duration && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" /> {row.duration}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-white">{row.reason}</p>
                {row.details && <p className="mt-1 text-xs leading-relaxed text-slate-400">{row.details}</p>}
                <p className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {fmtDate(row.moderation_date || row.created_date)}
                  </span>
                  {row.staff_member && <span>Issued by {row.staff_member}</span>}
                </p>
              </div>

              {row.status === "Active" && (
                <Btn size="sm" variant={already ? "ghost" : "primary"} disabled={already} onClick={() => onAppeal(row)}>
                  {already ? <><Check className="h-3.5 w-3.5" /> Appealed</> : <><Gavel className="h-3.5 w-3.5" /> Appeal</>}
                </Btn>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AppealsList({ appeals }) {
  if (!appeals.length) {
    return <Empty icon={Gavel} title="No appeals yet" body="When you appeal a punishment it will appear here with the staff decision." />;
  }

  return (
    <div className="space-y-3">
      {appeals.map((appeal) => (
        <Card key={appeal.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone={statusTone(appeal.status)}>{appeal.status}</Badge>
            <span className="text-[11px] text-slate-500">{fmtDateTime(appeal.created_date)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{appeal.appeal_reason}</p>
          {appeal.staff_response && (
            <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Staff response</p>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{appeal.staff_response}</p>
              <p className="mt-2 text-[11px] text-slate-500">{appeal.decided_by || "Staff"} · {fmtDateTime(appeal.decided_at)}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function BugReportsPanel({ reports, loading, username, onCreated }) {
  const { toast } = useApp();
  const [form, setForm] = useState({ title: "", description: "", severity: "Low" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username) {
      toast("Add your Roblox username in settings first", "error");
      return;
    }
    setBusy(true);
    try {
      await db.insert("bug_reports", { ...form, roblox_username: username, status: "Submitted" });
      setForm({ title: "", description: "", severity: "Low" });
      toast("Bug report sent");
      onCreated();
    } catch (err) {
      toast(err.message || "Could not send the report", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h3 className="text-sm font-semibold text-white">Report a bug</h3>
        <p className="mt-1 text-xs text-slate-400">Found something broken in-game? Let the team know.</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field label="Short summary">
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Elevator clips through the floor" className={INPUT} required />
          </Field>
          <Field label="What happened?">
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4} placeholder="Steps to reproduce, expected result, actual result…" className={INPUT} required />
          </Field>
          <Field label="Severity">
            <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))} className={INPUT}>
              {BUG_SEVERITY.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Btn type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />} Send report
          </Btn>
        </form>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Your reports</h3>
        {loading ? <Loading label="Loading reports" /> : reports.length ? (
          <div className="space-y-2">
            {reports.map((report) => (
              <Card key={report.id} className="p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-xs font-semibold text-white">{report.title}</p>
                  <Badge tone={statusTone(report.status)}>{report.status}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{report.description}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  {report.severity} · {fmtDate(report.created_date)}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Empty icon={Bug} title="No reports sent" body="Submitted reports and their review status show here." />
        )}
      </div>
    </div>
  );
}

function PortalPage() {
  const { user, toast } = useApp();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [appealTarget, setAppealTarget] = useState(null);
  const [appealOpen, setAppealOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const username = user.roblox_username;

  const load = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [mods, apps, notes, bugs] = await Promise.all([
        db.list("moderations", { match: { roblox_username: username }, order: "-created_date" }),
        db.list("appeals", { match: { roblox_username: username }, order: "-created_date" }),
        db.list("notifications", { match: { roblox_username: username }, order: "-created_date", limit: 40 }),
        db.list("bug_reports", { match: { roblox_username: username }, order: "-created_date", limit: 40 }),
      ]);
      setModerations(mods);
      setAppeals(apps);
      setNotifications(notes);
      setReports(bugs);
    } catch (err) {
      toast(err.message || "Could not load your portal", "error");
    } finally {
      setLoading(false);
    }
  }, [username, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const appealedIds = useMemo(() => {
    const set = new Set();
    appeals.forEach((a) => a.status !== "Denied" && set.add(a.moderation_id));
    return set;
  }, [appeals]);

  const openAppeal = (moderation) => {
    setAppealTarget(moderation);
    setAppealOpen(true);
  };

  const submitAppeal = async (form) => {
    setBusy(true);
    try {
      await db.insert("appeals", {
        roblox_username: username,
        moderation_id: appealTarget?.id || "unlisted",
        appeal_reason: form.appeal_reason,
        why_accepted: form.why_accepted,
        deserved_infraction: form.deserved_infraction,
        status: "Pending",
      });
      toast("Appeal submitted — staff will review it soon");
      setAppealOpen(false);
      setAppealTarget(null);
      await load();
    } catch (err) {
      toast(err.message || "Could not submit the appeal", "error");
    } finally {
      setBusy(false);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return;
    await Promise.all(unread.map((n) => db.update("notifications", n.id, { read: true })));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unread = notifications.filter((n) => !n.read).length;
  const activeCount = moderations.filter((m) => m.status === "Active").length;
  const pendingAppeals = appeals.filter((a) => ["Pending", "Under Review"].includes(a.status)).length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "Moderation", count: moderations.length },
    { id: "appeals", label: "Appeals", count: appeals.length },
    { id: "support", label: "Support" },
  ];

  if (!username) {
    return (
      <main className="page-in mx-auto max-w-2xl px-5 py-20">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
            <User className="h-5 w-5 text-amber-300" />
          </div>
          <h1 className="text-xl font-bold text-white">Link your Roblox account</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            Add your Roblox username so we can match you to your moderation history and applications.
          </p>
          <Btn as="a" href="#/settings" className="mt-5">Open settings <ArrowRight className="h-4 w-4" /></Btn>
        </Card>
      </main>
    );
  }

  return (
    <main className="page-in mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">Member portal</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Hey, {user.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Signed in as <span className="font-medium text-cyan-300">@{username}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" size="sm" onClick={load}>
            <Loader2 className={cx("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
          </Btn>
          <Btn size="sm" onClick={() => { setAppealTarget(null); setAppealOpen(true); }}>
            <Gavel className="h-3.5 w-3.5" /> New appeal
          </Btn>
        </div>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cx(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors",
            tab === item.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
          )}>
            {item.label}
            {item.count > 0 && <span className="rounded-full bg-white/10 px-1.5 text-[10px] leading-4 text-slate-300">{item.count}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Active punishments" value={activeCount} tone={activeCount ? "rose" : "emerald"} icon={Shield} />
            <StatCard label="Appeals open" value={pendingAppeals} tone="violet" icon={Gavel} />
            <StatCard label="Total infractions" value={moderations.length} tone="cyan" icon={FileText} />
            <StatCard label="Unread notices" value={unread} tone="amber" icon={Bell} />
          </div>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">Inbox</h2>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length ? (
              <div className="space-y-2">
                {notifications.slice(0, 6).map((note) => (
                  <div key={note.id} className={cx("rounded-lg border p-3", note.read ? "border-white/5 bg-white/[0.02]" : "border-cyan-500/20 bg-cyan-500/[0.06]")}>
                    <div className="flex items-center gap-2">
                      {!note.read && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                      <p className="text-xs font-semibold text-white">{note.title}</p>
                      <span className="ml-auto text-[10px] text-slate-500">{fmtDate(note.created_date)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{note.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">No notifications yet.</p>
            )}
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">Recent moderation</h2>
            <ModerationList moderations={moderations.slice(0, 3)} loading={loading} onAppeal={openAppeal} appealedIds={appealedIds} />
          </div>
        </div>
      )}

      {tab === "history" && (
        <ModerationList moderations={moderations} loading={loading} onAppeal={openAppeal} appealedIds={appealedIds} />
      )}
      {tab === "appeals" && (loading ? <Loading label="Loading appeals" /> : <AppealsList appeals={appeals} />)}
      {tab === "support" && <BugReportsPanel reports={reports} loading={loading} username={username} onCreated={load} />}

      <AppealDialog open={appealOpen} onClose={() => setAppealOpen(false)} moderation={appealTarget} onSubmit={submitAppeal} busy={busy} />
    </main>
  );
}

/* ============================== applications ============================== */

function ApplyDialog({ application, open, onClose, username, onSubmitted }) {
  const { toast } = useApp();
  const questions = useMemo(() => parseQuestions(application?.questions), [application]);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setAnswers({});
  }, [open]);

  const submit = async () => {
    setBusy(true);
    try {
      await db.insert("application_responses", {
        application_id: application.id,
        application_title: application.title,
        roblox_username: username,
        answers: JSON.stringify(answers),
        status: "submitted",
      });
      toast("Application submitted");
      onSubmitted();
      onClose();
    } catch (err) {
      toast(err.message || "Could not submit your application", "error");
    } finally {
      setBusy(false);
    }
  };

  const complete = questions.every((q) => (answers[q.id] || "").trim().length > 0);

  return (
    <Modal open={open} onClose={onClose} wide title={application?.title || "Application"} subtitle={application?.description}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">{Object.keys(answers).length}/{questions.length} answered</p>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn disabled={busy || !complete} onClick={submit}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Submit
            </Btn>
          </div>
        </div>
      }>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Field key={question.id} label={`${index + 1}. ${question.label}`}>
            {question.type === "short" ? (
              <input value={answers[question.id] || ""} className={INPUT}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))} />
            ) : (
              <textarea value={answers[question.id] || ""} rows={3} className={INPUT}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))} />
            )}
          </Field>
        ))}
      </div>
    </Modal>
  );
}

function ApplicationsPage() {
  const { user, toast } = useApp();
  const [applications, setApplications] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [apps, mine] = await Promise.all([
        db.list("applications", { order: "-created_date" }),
        db.list("application_responses", { match: { roblox_username: user.roblox_username }, order: "-created_date" }),
      ]);
      setApplications(apps.filter((a) => a.status !== "draft"));
      setResponses(mine);
    } catch (err) {
      toast(err.message || "Could not load applications", "error");
    } finally {
      setLoading(false);
    }
  }, [user.roblox_username, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = applications.filter((app) =>
    `${app.title} ${app.category || ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const submittedFor = (id) => responses.find((r) => r.application_id === id);

  return (
    <main className="page-in mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">Recruitment</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Applications</h1>
        <p className="mt-1 text-sm text-slate-400">Open roles and every submission you have made.</p>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applications…" className={cx(INPUT, "pl-9")} />
      </div>

      {loading ? (
        <Loading label="Loading applications" />
      ) : filtered.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((app) => {
            const mine = submittedFor(app.id);
            return (
              <Card key={app.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-white">{app.title}</h2>
                    <Badge tone={app.status === "open" ? "emerald" : "slate"}>{app.status}</Badge>
                  </div>
                  {app.category && (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{app.category}</p>
                  )}
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400">
                    {app.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                  {mine ? (
                    <Badge tone={statusTone(mine.status)}>{mine.status.replace("_", " ")}</Badge>
                  ) : (
                    <span className="text-[11px] text-slate-500">{parseQuestions(app.questions).length} questions</span>
                  )}
                  <Btn size="sm" variant={mine ? "ghost" : "primary"}
                    disabled={app.status !== "open" || Boolean(mine) || !user.roblox_username}
                    onClick={() => setActive(app)}>
                    {mine ? "Submitted" : app.status === "open" ? "Apply" : "Closed"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty icon={FileText} title="No applications available" body="There are no open recruitment forms right now. Check back soon." />
      )}

      {!user.roblox_username && applications.length > 0 && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Add your Roblox username in <a href="#/settings" className="font-semibold underline">settings</a> before applying.</span>
        </div>
      )}

      <ApplyDialog application={active} open={Boolean(active)} onClose={() => setActive(null)}
        username={user.roblox_username} onSubmitted={load} />
    </main>
  );
}

/* ============================== admin ============================== */

function ModerationForm({ onCreated }) {
  const { user, toast } = useApp();
  const empty = { roblox_username: "", moderation_type: "Warning", reason: "", details: "", duration: "", status: "Active" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const name = form.roblox_username.trim();
      await db.insert("moderations", { ...form, roblox_username: name, staff_member: user.full_name, moderation_date: new Date().toISOString() });
      await db.insert("notifications", { roblox_username: name, title: `${form.moderation_type} issued`, body: form.reason, read: false });
      toast("Moderation issued");
      setForm(empty);
      onCreated();
    } catch (err) {
      toast(err.message || "Could not issue moderation", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Issue moderation</h3>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Roblox username">
          <input value={form.roblox_username} onChange={update("roblox_username")} className={INPUT} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.moderation_type} onChange={update("moderation_type")} className={INPUT}>
              {MOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Duration">
            <input value={form.duration} onChange={update("duration")} placeholder="24h, 7d, Permanent" className={INPUT} />
          </Field>
        </div>
        <Field label="Reason">
          <input value={form.reason} onChange={update("reason")} placeholder="Exploiting" className={INPUT} required />
        </Field>
        <Field label="Details">
          <textarea value={form.details} onChange={update("details")} rows={3} className={INPUT} />
        </Field>
        <Btn type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Issue
        </Btn>
      </form>
    </Card>
  );
}

function AdminModerations({ moderations, loading, onChanged }) {
  const { toast } = useApp();

  const setStatus = async (row, status) => {
    await db.update("moderations", row.id, { status });
    toast(`Marked ${status.toLowerCase()}`);
    onChanged();
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete the ${row.moderation_type} for ${row.roblox_username}?`)) return;
    await db.remove("moderations", row.id);
    toast("Moderation deleted");
    onChanged();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <ModerationForm onCreated={onChanged} />

      <div className="space-y-2">
        {loading ? <Loading label="Loading moderations" /> : moderations.length ? moderations.map((row) => (
          <Card key={row.id} className="p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-white">@{row.roblox_username}</span>
              <Badge tone={typeTone(row.moderation_type)}>{row.moderation_type}</Badge>
              <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              <span className="ml-auto text-[10px] text-slate-500">{fmtDate(row.created_date)}</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-300">{row.reason}</p>
            {row.details && <p className="mt-1 text-[11px] text-slate-500">{row.details}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MOD_STATUS.filter((s) => s !== row.status).map((s) => (
                <Btn key={s} size="sm" variant="ghost" onClick={() => setStatus(row, s)}>{s}</Btn>
              ))}
              <Btn size="sm" variant="danger" onClick={() => remove(row)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Btn>
            </div>
          </Card>
        )) : <Empty icon={Shield} title="No moderation records" body="Issue one with the form on the left." />}
      </div>
    </div>
  );
}

function AdminAppeals({ appeals, loading, onChanged }) {
  const { user, toast } = useApp();
  const [drafts, setDrafts] = useState({});
  const [filter, setFilter] = useState("Pending");

  const decide = async (appeal, status) => {
    const response = drafts[appeal.id] || "";
    await db.update("appeals", appeal.id, {
      status, staff_response: response, decided_by: user.full_name, decided_at: new Date().toISOString(),
    });
    await db.insert("notifications", {
      roblox_username: appeal.roblox_username,
      title: `Appeal ${status.toLowerCase()}`,
      body: response || "Staff have reviewed your appeal.",
      read: false,
    });
    toast(`Appeal ${status.toLowerCase()}`);
    onChanged();
  };

  const shown = appeals.filter((a) => filter === "All" || a.status === filter);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {["Pending", "Under Review", "Approved", "Denied", "All"].map((status) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={cx(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            filter === status ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}>
            {status}
          </button>
        ))}
      </div>

      {loading ? <Loading label="Loading appeals" /> : shown.length ? (
        <div className="space-y-3">
          {shown.map((appeal) => (
            <Card key={appeal.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-white">@{appeal.roblox_username}</span>
                <Badge tone={statusTone(appeal.status)}>{appeal.status}</Badge>
                <span className="ml-auto text-[10px] text-slate-500">{fmtDateTime(appeal.created_date)}</span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{appeal.appeal_reason}</p>
              {appeal.why_accepted && (
                <p className="mt-2 rounded-lg bg-white/[0.03] p-2.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Why accept: </span>{appeal.why_accepted}
                </p>
              )}
              {appeal.deserved_infraction && <p className="mt-1 text-[11px] text-slate-500">{appeal.deserved_infraction}</p>}

              {["Pending", "Under Review"].includes(appeal.status) && (
                <div className="mt-3 space-y-2">
                  <textarea value={drafts[appeal.id] || ""} rows={2} placeholder="Response shown to the player…" className={INPUT}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [appeal.id]: e.target.value }))} />
                  <div className="flex flex-wrap gap-1.5">
                    <Btn size="sm" variant="success" onClick={() => decide(appeal, "Approved")}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => decide(appeal, "Denied")}>
                      <X className="h-3.5 w-3.5" /> Deny
                    </Btn>
                    <Btn size="sm" variant="ghost" onClick={async () => {
                      await db.update("appeals", appeal.id, { status: "Under Review" });
                      onChanged();
                    }}>
                      Mark under review
                    </Btn>
                  </div>
                </div>
              )}

              {appeal.staff_response && appeal.status !== "Pending" && (
                <p className="mt-2 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Response: </span>{appeal.staff_response}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Empty icon={Gavel} title="Nothing here" body={`No appeals with status ${filter.toLowerCase()}.`} />
      )}
    </div>
  );
}

function AdminApplications({ applications, responses, loading, onChanged }) {
  const { user, toast } = useApp();
  const [form, setForm] = useState({ title: "", description: "", category: "General", status: "open", questions: "" });
  const [busy, setBusy] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const questions = form.questions.split("\n").map((l) => l.trim()).filter(Boolean)
        .map((label, i) => ({ id: `q${i + 1}`, label, type: "long" }));
      await db.insert("applications", {
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        questions: JSON.stringify(questions.length ? questions : parseQuestions(null)),
      });
      toast("Application created");
      setForm({ title: "", description: "", category: "General", status: "open", questions: "" });
      onChanged();
    } catch (err) {
      toast(err.message || "Could not create the application", "error");
    } finally {
      setBusy(false);
    }
  };

  const setResponseStatus = async (row, status) => {
    await db.update("application_responses", row.id, { status, reviewed_by: user.email, reviewed_at: new Date().toISOString() });
    toast(`Marked ${status.replace("_", " ")}`);
    onChanged();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-white">New application</h3>
        <form onSubmit={create} className="space-y-3">
          <Field label="Title">
            <input value={form.title} placeholder="Staff Application" className={INPUT} required
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} rows={2} className={INPUT}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input value={form.category} className={INPUT} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            </Field>
            <Field label="Status">
              <select value={form.status} className={INPUT} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="open">open</option>
                <option value="closed">closed</option>
                <option value="draft">draft</option>
              </select>
            </Field>
          </div>
          <Field label="Questions" hint="One question per line.">
            <textarea value={form.questions} rows={5} className={INPUT} placeholder={"Why do you want to join?\nDescribe your experience…"}
              onChange={(e) => setForm((p) => ({ ...p, questions: e.target.value }))} />
          </Field>
          <Btn type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
          </Btn>
        </form>
      </Card>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Forms</h3>
          {applications.length ? (
            <div className="space-y-2">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                  <span className="truncate text-xs font-medium text-white">{app.title}</span>
                  <Badge tone={app.status === "open" ? "emerald" : "slate"}>{app.status}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-500">No forms yet.</p>}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Responses</h3>
          {loading ? <Loading label="Loading responses" /> : responses.length ? (
            <div className="space-y-2">
              {responses.map((row) => (
                <Card key={row.id} className="p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-white">@{row.roblox_username}</span>
                    <span className="text-[11px] text-slate-500">{row.application_title}</span>
                    <Badge tone={statusTone(row.status)} className="ml-auto">{row.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {Object.entries(parseAnswers(row.answers)).map(([key, value]) => (
                      <p key={key} className="text-[11px] leading-relaxed text-slate-400">
                        <span className="text-slate-500">{key}: </span>{value}
                      </p>
                    ))}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Btn size="sm" variant="success" onClick={() => setResponseStatus(row, "accepted")}>Accept</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setResponseStatus(row, "rejected")}>Reject</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setResponseStatus(row, "under_review")}>Under review</Btn>
                  </div>
                </Card>
              ))}
            </div>
          ) : <Empty icon={FileText} title="No responses yet" body="Submissions from applicants appear here." />}
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const { user, toast } = useApp();
  const [tab, setTab] = useState("moderations");
  const [loading, setLoading] = useState(true);
  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [applications, setApplications] = useState([]);
  const [responses, setResponses] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mods, apps, forms, subs] = await Promise.all([
        db.list("moderations", { order: "-created_date", limit: 200 }),
        db.list("appeals", { order: "-created_date", limit: 200 }),
        db.list("applications", { order: "-created_date" }),
        db.list("application_responses", { order: "-created_date", limit: 200 }),
      ]);
      setModerations(mods);
      setAppeals(apps);
      setApplications(forms);
      setResponses(subs);
    } catch (err) {
      toast(err.message || "Could not load admin data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isStaffRole(user)) {
    return (
      <main className="page-in mx-auto max-w-lg px-5 py-20">
        <Empty icon={Lock} title="Staff only" body="This area is limited to accounts with the staff or admin role."
          action={<Btn as="a" href="#/portal" variant="ghost" size="sm">Back to portal</Btn>} />
      </main>
    );
  }

  const tabs = [
    { id: "moderations", label: "Moderation", count: moderations.length },
    { id: "appeals", label: "Appeals", count: appeals.filter((a) => a.status === "Pending").length },
    { id: "applications", label: "Applications", count: responses.length },
  ];

  return (
    <main className="page-in mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400">Staff tools</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Manage punishments, decide appeals and review applications.</p>
        </div>
        <Btn variant="ghost" size="sm" onClick={load}>
          <Loader2 className={cx("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
        </Btn>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cx(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors",
            tab === item.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
          )}>
            {item.label}
            {item.count > 0 && <span className="rounded-full bg-white/10 px-1.5 text-[10px] leading-4 text-slate-300">{item.count}</span>}
          </button>
        ))}
      </div>

      {tab === "moderations" && <AdminModerations moderations={moderations} loading={loading} onChanged={load} />}
      {tab === "appeals" && <AdminAppeals appeals={appeals} loading={loading} onChanged={load} />}
      {tab === "applications" && (
        <AdminApplications applications={applications} responses={responses} loading={loading} onChanged={load} />
      )}
    </main>
  );
}

/* ============================== settings ============================== */

function SettingsPage() {
  const { user, setUser, toast } = useApp();
  const [form, setForm] = useState({ full_name: user.full_name || "", roblox_username: user.roblox_username || "" });
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await auth.updateProfile({
        full_name: form.full_name.trim(),
        roblox_username: form.roblox_username.trim(),
      });
      setUser(next);
      toast("Profile saved");
    } catch (err) {
      toast(err.message || "Could not save your profile", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-in mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-white">Account settings</h1>
      <p className="mt-1 text-sm text-slate-400">Keep your details up to date so staff can find your record.</p>

      <Card className="mt-6">
        <form onSubmit={save} className="space-y-4">
          <Field label="Display name">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={form.full_name} className={cx(INPUT, "pl-9")} required
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
            </div>
          </Field>

          <Field label="Roblox username" hint="Used to match your moderation history.">
            <input value={form.roblox_username} placeholder="YourRobloxName" className={INPUT}
              onChange={(e) => setForm((p) => ({ ...p, roblox_username: e.target.value }))} />
          </Field>

          <Field label="Email address" hint="Contact an admin to change your email.">
            <input value={user.email} readOnly className={cx(INPUT, "text-slate-400")} />
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
            <span className="text-xs text-slate-400">Role</span>
            <Badge tone={isStaffRole(user) ? "amber" : "slate"}>{user.role}</Badge>
          </div>

          <Btn type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save changes
          </Btn>
        </form>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Storage</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {hasSupabase
                ? "Connected to Supabase — accounts and records sync across devices."
                : "Local mode — accounts and records live in this browser only."}
            </p>
          </div>
          <Badge tone={hasSupabase ? "emerald" : "amber"}>{hasSupabase ? "Supabase" : "localStorage"}</Badge>
        </div>
      </Card>

      <Btn variant="danger" className="mt-4 w-full" onClick={() => { auth.signOut(); window.location.hash = "/"; }}>
        <LogOut className="h-4 w-4" /> Sign out
      </Btn>
    </main>
  );
}

/* ============================== shell ============================== */

function NotFound() {
  return (
    <main className="page-in mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <AlertTriangle className="h-5 w-5 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-400">That link does not point anywhere in the portal.</p>
      <Btn as="a" href="#/" className="mt-5">Back home</Btn>
    </main>
  );
}

const PROTECTED = ["/portal", "/applications", "/admin", "/settings"];

function Shell() {
  const { user, ready } = useApp();
  const path = useRoute();
  const needsAuth = PROTECTED.some((route) => path === route || path.startsWith(`${route}/`));

  useEffect(() => {
    if (ready && user && (path === "/login" || path === "/register")) go("/portal");
  }, [ready, user, path]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090c18]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10">
            <Shield className="h-5 w-5 animate-pulse text-cyan-300" />
          </div>
          <p className="text-xs text-slate-500">Loading portal…</p>
        </div>
      </div>
    );
  }

  if (needsAuth && !user) {
    return (
      <div className="min-h-screen bg-[#090c18]">
        <Nav />
        <LoginPage redirect={path} />
      </div>
    );
  }

  let page;
  if (path === "/") page = <HomePage />;
  else if (path === "/login") page = <LoginPage redirect="/portal" />;
  else if (path === "/register") page = <RegisterPage />;
  else if (path === "/portal") page = <PortalPage />;
  else if (path === "/applications") page = <ApplicationsPage />;
  else if (path === "/admin") page = <AdminPage />;
  else if (path === "/settings") page = <SettingsPage />;
  else page = <NotFound />;

  return (
    <div className="flex min-h-screen flex-col bg-[#090c18]">
      <Nav />
      <div className="flex-1">{page}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}