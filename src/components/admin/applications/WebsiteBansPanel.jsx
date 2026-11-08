import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Trash2, Plus, X, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { clearBanToken } from '@/lib/banEvasion';

export default function WebsiteBansPanel({ onClose }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [ipBans, setIpBans] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ipInput, setIpInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [bansList, usersList] = await Promise.all([
        base44.entities.IpBan.list('-created_date', 200).catch(() => []),
        base44.entities.User.list('-created_date', 500).catch(() => []),
      ]);
      setIpBans(Array.isArray(bansList) ? bansList : bansList?.items || []);
      const allUsers = Array.isArray(usersList) ? usersList : usersList?.items || [];
      setBannedUsers(allUsers.filter((u) => u.banned || u.data?.banned));
    } catch {
      setIpBans([]);
      setBannedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addIpBan = async () => {
    const ip = ipInput.trim();
    if (!ip) {
      toast({ title: 'Enter an IP address', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      await base44.entities.IpBan.create({
        ip_address: ip,
        reason: reasonInput.trim() || 'Banned by administrator',
        banned_by: user?.email || 'Admin',
      });
      toast({ title: 'IP address banned', description: `${ip} has been blocked from the website.` });
      setIpInput('');
      setReasonInput('');
      load();
    } catch (e) {
      toast({ title: 'Failed to add IP ban', description: e.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const removeIpBan = async (ban) => {
    try {
      await base44.entities.IpBan.delete(ban.id);
      clearBanToken();
      toast({ title: 'IP Unbanned', description: `${ban.ip_address} can access the website again.` });
      load();
    } catch (e) {
      toast({ title: 'Failed to unban IP', description: e.message, variant: 'destructive' });
    }
  };

  const clearAllIpBans = async () => {
    if (ipBans.length === 0) return;
    try {
      await Promise.all(ipBans.map((b) => base44.entities.IpBan.delete(b.id)));
      clearBanToken();
      toast({ title: 'Cleared all IP bans', description: 'All blocked IP addresses have been unbanned.' });
      load();
    } catch (e) {
      toast({ title: 'Failed to clear IP bans', description: e.message, variant: 'destructive' });
    }
  };

  const unbanUserAccount = async (u) => {
    try {
      await base44.entities.User.update(u.id, {
        banned: false,
        banned_reason: null,
        banned_until: null,
      });
      const lastIp = u.last_ip || u.data?.last_ip;
      if (lastIp) {
        await base44.entities.IpBan.deleteMany({ ip_address: lastIp }).catch(() => {});
      }
      clearBanToken();
      toast({
        title: 'Account & IP Unbanned',
        description: `${u.email} has been restored.`,
      });
      load();
    } catch (e) {
      toast({ title: 'Failed to unban account', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[65] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl bg-slate-950 border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 shrink-0">
              <Globe className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">IP & Website Bans</h2>
              <p className="text-xs text-slate-400">View and unban blocked IP addresses and banned portal accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add IP Ban */}
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ban an IP Address</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Input
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="IP address (e.g. 174.168.218.192)"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono text-xs"
              onKeyDown={(e) => e.key === 'Enter' && addIpBan()}
            />
            <Input
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Reason (optional)"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && addIpBan()}
            />
          </div>
          <Button onClick={addIpBan} disabled={adding} size="sm" className="w-full bg-rose-600 hover:bg-rose-500 text-white border-0">
            {adding ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Block IP Address
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading bans…
          </div>
        ) : (
          <>
            {/* Active IP Bans */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active IP Bans ({ipBans.length})
                </h3>
                {ipBans.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAllIpBans}
                    className="text-xs text-rose-300 hover:text-rose-200 underline underline-offset-4"
                  >
                    Unban All IPs
                  </button>
                )}
              </div>

              {ipBans.length === 0 ? (
                <div className="rounded-xl bg-white/[0.02] border border-white/10 py-6 text-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">No IP addresses are currently banned.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ipBans.map((ban) => (
                    <div
                      key={ban.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-rose-300">{ban.ip_address}</span>
                          {ban.created_date && (
                            <span className="text-[10px] text-slate-500">
                              {new Date(ban.created_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {ban.reason && <p className="text-xs text-slate-300 mt-0.5 truncate">{ban.reason}</p>}
                        {ban.banned_by && <p className="text-[10px] text-slate-500">Banned by {ban.banned_by}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeIpBan(ban)}
                        className="shrink-0 text-emerald-300 hover:text-white hover:bg-emerald-500/15 border border-emerald-500/30 bg-emerald-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Unban IP
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Banned Portal Accounts */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Banned Website Accounts ({bannedUsers.length})
              </h3>

              {bannedUsers.length === 0 ? (
                <div className="rounded-xl bg-white/[0.02] border border-white/10 py-6 text-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">No portal user accounts are currently banned.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bannedUsers.map((u) => {
                    const rbx = u.roblox_username || u.data?.roblox_username;
                    const reason = u.banned_reason || u.data?.banned_reason;
                    const lastIp = u.last_ip || u.data?.last_ip;
                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <UserX className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                            <span className="text-sm font-medium text-white truncate">{u.email}</span>
                            {rbx && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                                @{rbx}
                              </span>
                            )}
                          </div>
                          {reason && <p className="text-xs text-slate-400 mt-0.5 truncate">Reason: {reason}</p>}
                          {lastIp && <p className="text-[10px] font-mono text-slate-500">Last IP: {lastIp}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => unbanUserAccount(u)}
                          className="shrink-0 text-emerald-300 hover:text-white hover:bg-emerald-500/15 border border-emerald-500/30 bg-emerald-500/10"
                        >
                          Unban Account
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}