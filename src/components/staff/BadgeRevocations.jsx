import { useEffect, useState } from 'react';
import { Ban, Loader2, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { listRevokedBadges, revokeBadge, restoreBadge } from '@/lib/badgeRevocation';

const INPUT =
  'h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50';

/** Revokes every printed badge for an account, and lets staff restore it later. */
export default function BadgeRevocations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    listRevokedBadges()
      .then(setItems)
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Enter a valid email address.');
      return;
    }
    if (items.some((item) => item.email === clean)) {
      setError('That account is already revoked.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await revokeBadge(clean, user?.email || '');
      setEmail('');
      await load();
    } catch (err) {
      setError(err.message || 'Could not revoke that account.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async (id) => {
    setBusy(true);
    try {
      await restoreBadge(id);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold text-white">Revoked badges</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        Badges already printed can't be recalled, so revoking an account makes every badge carrying
        its email stop working. The member can still sign in with their password.
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          placeholder="member@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
          aria-label="Account email to revoke"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
          Revoke
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-white/5 border-t border-white/5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{item.email}</p>
                <p className="truncate text-[11px] text-slate-500">
                  {item.revoked_by ? `Revoked by ${item.revoked_by}` : 'Revoked'}
                  {item.reason ? ` — ${item.reason}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => restore(item.id)}
                disabled={busy}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" /> Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}