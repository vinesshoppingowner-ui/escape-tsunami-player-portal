import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { findUserByRobloxUsername } from '@/lib/userLookup';
import { screenMessage, SEVERITY_STYLES } from '@/lib/profanity';
import PlayerQuickModerate from '@/components/admin/livechat/PlayerQuickModerate';
import { format } from 'date-fns';
import { Loader2, ShieldCheck, ShieldAlert, MessageSquare, Gavel, ExternalLink, AlertTriangle } from 'lucide-react';

export default function PlayerChatModal({ username, evidence, open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [mods, setMods] = useState([]);
  const [logs, setLogs] = useState([]);

  const load = async () => {
    if (!username) return;
    setLoading(true);
    const [acc, modRows, logRows] = await Promise.all([
      findUserByRobloxUsername(username),
      base44.entities.Moderation.filter({ roblox_username: username }, '-created_date', 50),
      base44.entities.ChatLog.filter({ roblox_username: username }, '-created_date', 100),
    ]);
    setAccount(acc);
    setMods(modRows || []);
    setLogs(logRows || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
  }, [open, username]); // eslint-disable-line react-hooks/exhaustive-deps

  const flagged = logs.map((l) => screenMessage(l.message)).filter((r) => r.severity);
  const counts = flagged.reduce((acc, r) => ({ ...acc, [r.severity]: (acc[r.severity] || 0) + 1 }), {});
  const activeBans = mods.filter((m) => m.status === 'Active' && m.moderation_type?.includes('Ban')).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Player details</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3.5">
          <RobloxAvatar username={username} size={60} />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white truncate">{username}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {activeBans > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  <ShieldAlert className="h-3 w-3" /> Active ban
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> No active ban
                </span>
              )}
              <a
                href={`https://www.roblox.com/users/profile?username=${encodeURIComponent(username)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:underline"
              >
                Roblox profile <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-cyan-400" /></div>
        ) : (
          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Messages', value: logs.length, icon: MessageSquare },
                { label: 'Flagged', value: flagged.length, icon: AlertTriangle },
                { label: 'Moderations', value: mods.length, icon: Gavel },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400">
                    <s.icon className="h-3 w-3 text-cyan-400/70" /> {s.label}
                  </div>
                  <p className="text-lg font-semibold tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            {flagged.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {['extreme', 'medium', 'mild'].filter((t) => counts[t]).map((t) => (
                  <span key={t} className={`text-[11px] px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[t].badge}`}>
                    {counts[t]} × {SEVERITY_STYLES[t].label}
                  </span>
                ))}
              </div>
            )}

            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Portal account</h3>
              {account ? (
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 text-sm space-y-1">
                  <p className="text-white font-medium">{account.full_name || account.email}</p>
                  <p className="text-slate-400 text-xs">{account.email}</p>
                  <p className="text-slate-500 text-xs">
                    Role: {account.role || 'user'} · Joined {account.created_date ? format(new Date(account.created_date), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No linked portal account — this player hasn't verified on the website.</p>
              )}
            </section>

            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Moderation history</h3>
              {mods.length === 0 ? (
                <p className="text-sm text-slate-500">Clean record.</p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {mods.map((m) => (
                    <div key={m.id} className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{m.moderation_type}</span>
                        <span className="text-slate-500">{m.status}</span>
                        <span className="ml-auto text-slate-500">
                          {m.moderation_date ? format(new Date(m.moderation_date), 'MMM d, yyyy') : ''}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{m.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Recent chat history</h3>
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500">No stored messages.</p>
              ) : (
                <div className="space-y-1 max-h-52 overflow-y-auto rounded-xl bg-slate-950/50 border border-white/10 p-2.5">
                  {[...logs].reverse().map((l) => {
                    const { severity } = screenMessage(l.message);
                    const t = l.timestamp || l.created_date;
                    return (
                      <div key={l.id} className={`flex gap-2 text-xs px-1.5 py-1 rounded ${severity ? SEVERITY_STYLES[severity].row : ''}`}>
                        <span className="text-slate-600 font-mono tabular-nums shrink-0">
                          {t ? format(new Date(t), 'h:mm a') : ''}
                        </span>
                        <span className="text-slate-300 break-words">{l.message}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Moderate this player</h3>
              <PlayerQuickModerate username={username} evidence={evidence} onDone={load} />
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}