import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  X,
  Search,
  Link2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  History,
  Crown,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function OwnerRobloxLinkModal({ open, onClose, initialEmail = '' }) {
  const { toast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [robloxInput, setRobloxInput] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [linking, setLinking] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await base44.functions.invoke('adminVerifyRoblox', { action: 'history' });
      if (res?.data?.history) {
        setHistory(res.data.history);
      }
    } catch {
      // ignore history load errors
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (initialEmail) setEmail(initialEmail);
      setError('');
      setPreview(null);
      setSuccessResult(null);
      setForceOverwrite(false);
      loadHistory();
    }
  }, [open, initialEmail]);

  if (!open) return null;

  const handlePreview = async (e) => {
    e?.preventDefault();
    setError('');
    setPreview(null);
    setSuccessResult(null);
    setForceOverwrite(false);

    if (!email.trim() || !robloxInput.trim()) {
      setError('Please enter both the portal email (or account ID) and the Roblox username or ID.');
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await base44.functions.invoke('adminVerifyRoblox', {
        action: 'preview',
        email: email.trim(),
        robloxInput: robloxInput.trim(),
      });
      if (res?.data?.error) {
        setError(res.data.error);
      } else {
        setPreview(res.data);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Could not look up account details.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmLink = async () => {
    if (!preview) return;
    const needsForce = Boolean(preview.conflictUser || preview.existingLink);
    if (needsForce && !forceOverwrite) {
      setError('Please check the confirmation box to overwrite the existing Roblox link.');
      return;
    }

    setLinking(true);
    setError('');
    try {
      const res = await base44.functions.invoke('adminVerifyRoblox', {
        action: 'confirm',
        email: preview.targetUser.email,
        robloxInput: String(preview.robloxUser.id),
        forceOverwrite,
      });
      if (res?.data?.error) {
        setError(res.data.error);
        return;
      }
      setSuccessResult(res.data);
      setPreview(null);
      toast({
        title: 'Roblox account linked',
        description: `Linked @${res.data.robloxUser.name} to ${res.data.targetUser.email}`,
      });
      loadHistory();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to link Roblox account.');
    } finally {
      setLinking(false);
    }
  };

  const needsConfirmation = Boolean(preview?.conflictUser || preview?.existingLink);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0d111d] border border-amber-500/30 shadow-[0_24px_70px_rgba(0,0,0,0.65)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/15 via-violet-500/10 to-transparent border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white">Direct Roblox Account Link</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Owner Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Link a player's portal account directly by email and Roblox username or user ID.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Search & Resolve Form */}
          <form onSubmit={handlePreview} className="space-y-3.5">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Portal User Email or Account ID
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Roblox Username or User ID
                </label>
                <Input
                  value={robloxInput}
                  onChange={(e) => setRobloxInput(e.target.value)}
                  placeholder="e.g. Builderman or 156"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loadingPreview || !email.trim() || !robloxInput.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-10 px-4 text-xs font-semibold"
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Verifying accounts…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1.5" /> Lookup & Preview Link
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {successResult && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Account Successfully Linked
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Portal user <strong className="text-white">{successResult.targetUser.email}</strong> is now linked to Roblox account{' '}
                <strong className="text-cyan-300">@{successResult.robloxUser.name}</strong> (ID: <span className="font-mono">{successResult.robloxUser.id}</span>).
              </p>
            </div>
          )}

          {/* Resolved Preview Card */}
          {preview && (
            <div className="rounded-2xl bg-white/[0.03] border border-cyan-500/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Review Target & Roblox Identity
                </span>
                <span className="text-[11px] text-slate-400">Confirm before saving</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Target Portal Account */}
                <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3.5 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Portal Account
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {preview.targetUser.full_name || preview.targetUser.email}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{preview.targetUser.email}</div>
                  <div className="text-[11px] text-slate-500 font-mono">ID: {preview.targetUser.id}</div>
                  {preview.existingLink ? (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-amber-300">
                      Currently linked to: <strong>@{preview.existingLink.username}</strong>
                      {preview.existingLink.userId ? ` (${preview.existingLink.userId})` : ''}
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-500">
                      No Roblox account currently linked
                    </div>
                  )}
                </div>

                {/* Resolved Roblox Profile */}
                <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3.5 flex items-center gap-3">
                  {preview.robloxUser.headshot ? (
                    <img
                      src={preview.robloxUser.headshot}
                      alt={preview.robloxUser.name}
                      className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                      R
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                      Roblox Identity
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {preview.robloxUser.displayName || preview.robloxUser.name}
                    </div>
                    <div className="text-xs text-cyan-300 truncate">@{preview.robloxUser.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ID: {preview.robloxUser.id}
                    </div>
                    <a
                      href={`https://www.roblox.com/users/${preview.robloxUser.id}/profile`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      View profile <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Conflict or Overwrite Warnings */}
              {preview.conflictUser && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-start gap-2.5 text-xs text-rose-200">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Conflict detected:</strong> Roblox user{' '}
                    <strong>@{preview.robloxUser.name}</strong> is already linked to another portal account (
                    <span className="underline">{preview.conflictUser.email}</span>). Confirming with overwrite will move this Roblox link to{' '}
                    <strong>{preview.targetUser.email}</strong>.
                  </div>
                </div>
              )}

              {preview.existingLink && !preview.conflictUser && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Existing link on account:</strong>{' '}
                    <strong>{preview.targetUser.email}</strong> is currently linked to{' '}
                    <strong>@{preview.existingLink.username}</strong>. Confirming will replace it with{' '}
                    <strong>@{preview.robloxUser.name}</strong>.
                  </div>
                </div>
              )}

              {needsConfirmation && (
                <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={forceOverwrite}
                    onChange={(e) => setForceOverwrite(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-amber-500 rounded"
                  />
                  <span>
                    I confirm that I want to overwrite the existing Roblox link and assign{' '}
                    <strong className="text-white">@{preview.robloxUser.name}</strong> to{' '}
                    <strong className="text-white">{preview.targetUser.email}</strong>.
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPreview(null)}
                  className="text-slate-400 hover:text-white h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmLink}
                  disabled={linking || (needsConfirmation && !forceOverwrite)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 h-9 px-4 text-xs font-semibold"
                >
                  {linking ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Linking Account…
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Confirm & Link Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Recent Admin Account-Link Audit History */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <History className="h-3.5 w-3.5 text-cyan-400" />
                Recent Admin Account Links
              </div>
              <button
                type="button"
                onClick={loadHistory}
                className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${loadingHistory ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {loadingHistory && history.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin inline mr-1.5" /> Loading recent links…
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-xl bg-white/[0.02] border border-white/5 py-5 text-center text-xs text-slate-500">
                No direct account links recorded yet.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white/[0.02] border border-white/10 px-3 py-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link2 className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-white">@{item.roblox_username}</span>
                        {item.target_email && (
                          <>
                            <span className="text-slate-500">→</span>
                            <span className="text-cyan-200 truncate">{item.target_email}</span>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.reviewer_note || 'Linked by Owner'}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0 text-right">
                      {item.created_date ? new Date(item.created_date).toLocaleString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}