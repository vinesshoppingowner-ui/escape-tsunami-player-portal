import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------
   Config — set these in .env at the project root:
     VITE_SUPABASE_URL=https://xxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=xxxx
   Without them everything falls back to localStorage so the app still
   runs offline with zero configuration.
------------------------------------------------------------------ */

const URL_FROM_ENV = import.meta.env.VITE_SUPABASE_URL || "";
const KEY_FROM_ENV = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const hasSupabase = Boolean(URL_FROM_ENV && KEY_FROM_ENV);
export const supabase = hasSupabase ? createClient(URL_FROM_ENV, KEY_FROM_ENV) : null;

const KEYS = {
  users: "etsu.users",
  session: "etsu.session",
  db: "etsu.db",
};

const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked or full — the app keeps working in memory */
  }
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const hashPassword = async (password) => {
  const input = `etsu:${password}`;
  if (globalThis.crypto?.subtle) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(bytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return btoa(unescape(encodeURIComponent(input)));
};

const publicUser = (record) => ({
  id: record.id,
  email: record.email,
  full_name: record.full_name || (record.email || "").split("@")[0] || "Member",
  role: record.role || "user",
  roblox_username: record.roblox_username || "",
});

const emitLocalSession = () => {
  window.dispatchEvent(new Event("etsu:session"));
};

const normaliseEmail = (email) => (email || "").trim().toLowerCase();

/* ------------------------------ AUTH ------------------------------ */

async function supabaseProfile(authUser) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  return publicUser({
    id: authUser.id,
    email: authUser.email,
    full_name:
      data?.full_name ||
      authUser.user_metadata?.full_name ||
      (authUser.email || "").split("@")[0],
    role: data?.role || "user",
    roblox_username: data?.roblox_username || "",
  });
}

export const auth = {
  async signUp(email, password, fullName) {
    const cleanEmail = normaliseEmail(email);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      throw new Error("Enter a valid email address");
    }
    if ((password || "").length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (hasSupabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Check your email to confirm your account");
      const profile = publicUser({
        id: data.user.id,
        email: cleanEmail,
        full_name: fullName,
        role: "user",
      });
      return profile;
    }

    const users = readLocal(KEYS.users, []);
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error("An account with that email already exists");
    }

    const record = {
      id: newId(),
      email: cleanEmail,
      full_name: (fullName || "").trim() || cleanEmail.split("@")[0],
      role: "user",
      roblox_username: "",
      password_hash: await hashPassword(password),
      created_date: new Date().toISOString(),
    };
    writeLocal(KEYS.users, [...users, record]);
    writeLocal(KEYS.session, { userId: record.id });
    emitLocalSession();
    return publicUser(record);
  },

  async signIn(email, password) {
    const cleanEmail = normaliseEmail(email);

    if (hasSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw new Error("Invalid email or password");
      return supabaseProfile(data.user);
    }

    const users = readLocal(KEYS.users, []);
    const found = users.find((u) => u.email === cleanEmail);
    if (!found) throw new Error("Invalid email or password");

    const attempt = await hashPassword(password);
    if (attempt !== found.password_hash) throw new Error("Invalid email or password");

    writeLocal(KEYS.session, { userId: found.id });
    emitLocalSession();
    return publicUser(found);
  },

  async signOut() {
    if (hasSupabase) {
      await supabase.auth.signOut();
      return;
    }
    try {
      localStorage.removeItem(KEYS.session);
    } catch {
      /* ignore */
    }
    emitLocalSession();
  },

  async getSession() {
    if (hasSupabase) {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) return null;
      return supabaseProfile(data.session.user);
    }

    const session = readLocal(KEYS.session, null);
    if (!session?.userId) return null;
    const users = readLocal(KEYS.users, []);
    const found = users.find((u) => u.id === session.userId);
    return found ? publicUser(found) : null;
  },

  async updateProfile(patch) {
    if (hasSupabase) {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) throw new Error("You are signed out");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: data.user.id, ...patch }, { onConflict: "id" });
      if (error) throw new Error(error.message);
      return supabaseProfile(data.user);
    }

    const session = readLocal(KEYS.session, null);
    if (!session?.userId) throw new Error("You are signed out");
    const users = readLocal(KEYS.users, []);
    const next = users.map((u) => (u.id === session.userId ? { ...u, ...patch } : u));
    writeLocal(KEYS.users, next);
    emitLocalSession();
    const found = next.find((u) => u.id === session.userId);
    return publicUser(found);
  },

  onChange(callback) {
    if (hasSupabase) {
      const { data } = supabase.auth.onAuthStateChange(() => {
        auth.getSession().then((user) => callback(user));
      });
      return () => data?.subscription?.unsubscribe?.();
    }

    const handler = () => {
      auth.getSession().then((user) => callback(user));
    };
    window.addEventListener("etsu:session", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("etsu:session", handler);
      window.removeEventListener("storage", handler);
    };
  },
};

/* ---------------------------- DATABASE ---------------------------- */

const sortRows = (rows, order) => {
  if (!order) return rows;
  const desc = order.startsWith("-");
  const field = desc ? order.slice(1) : order;
  return [...rows].sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (desc ? -1 : 1);
  });
};

export const db = {
  async list(table, options = {}) {
    const { match = {}, order = "-created_date", limit = 200 } = options;

    if (hasSupabase) {
      let query = supabase.from(table).select("*");
      Object.entries(match).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      if (order) {
        const desc = order.startsWith("-");
        query = query.order(desc ? order.slice(1) : order, { ascending: !desc });
      }
      const { data, error } = await query.limit(limit);
      if (error) throw new Error(error.message);
      return data || [];
    }

    const store = readLocal(KEYS.db, {});
    const rows = (store[table] || []).filter((row) =>
      Object.entries(match).every(([key, value]) => row[key] === value)
    );
    return sortRows(rows, order).slice(0, limit);
  },

  async insert(table, row) {
    if (hasSupabase) {
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    const store = readLocal(KEYS.db, {});
    const now = new Date().toISOString();
    const record = { id: newId(), created_date: now, updated_date: now, ...row };
    store[table] = [...(store[table] || []), record];
    writeLocal(KEYS.db, store);
    return record;
  },

  async update(table, id, patch) {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const store = readLocal(KEYS.db, {});
    let updated = null;
    store[table] = (store[table] || []).map((row) => {
      if (row.id !== id) return row;
      updated = { ...row, ...patch, updated_date: new Date().toISOString() };
      return updated;
    });
    writeLocal(KEYS.db, store);
    return updated;
  },

  async remove(table, id) {
    if (hasSupabase) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    }

    const store = readLocal(KEYS.db, {});
    store[table] = (store[table] || []).filter((row) => row.id !== id);
    writeLocal(KEYS.db, store);
    return true;
  },
};

export const storageMode = hasSupabase ? "supabase" : "local";