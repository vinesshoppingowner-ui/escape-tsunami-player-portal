import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Ban, Trash2, Plus, X, ShieldBan, UserSearch } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const isEmail = (v) => /@/.test(v) && /\./.test(v);

export default function ApplicationBlacklistPanel({ onClose }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.ApplicationBlacklist.filter({}, { sort: '-created_date', limit: 200 });
      setEntries(page?.items || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const raw = identifier.trim();
    if (!raw) { toast({ title: 'Enter an email or Roblox username', variant: 'destructive' }); return; }
    setAdding(true);
    try {
      const lower = raw.toLowerCase();
      const robloxUsername = isEmail(lower) ? '' : lower;

      // Create a Moderation record so the player sees it in portal history and can appeal
      let linkedModerationId = '';
      if (robloxUsername) {
        const mod = await base44.entities.Moderation.create({
          roblox_username: robloxUsername,
          moderation_type: 'Permanent Ban',
          reason: 'Blacklisted from applications',
          details: reason.trim() ? `Blacklisted from submitting application forms. Reason: ${reason.trim()}` : 'Blacklisted from submitting application forms.',
          status: 'Active',
          staff_member: user?.full_name || user?.email || 'Admin',
          moderation_date: new Date().toISOString(),
        });
        linkedModerationId = mod?.id || '';
      }

      await base44.entities.ApplicationBlacklist.create({
        identifier: lower,
        roblox_username: robloxUsername || undefined,
        reason: reason.trim(),
        banned_by: user?.email,
        linked_moderation_id: linkedModerationId || undefined,
      });

      toast({ title: 'Blacklisted', description: `${raw} can no longer submit applications${robloxUsername ? ' — added to portal history' : ''}` });
      setIdentifier('');
      setReason('');
      load();
    } catch (e) {
      toast({ title: 'Failed to blacklist', description: e.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const remove = async (entry) => {
    try {
      // Repeal the linked Moderation so the portal reflects the removal
      if (entry.linked_moderation_id) {
        await base44.entities.Moderation.update(entry.linked_moderation_id, { status: 'Repealed' }).catch(() => {});
      }
      await base44.entities.ApplicationBlacklist.delete(entry.id);
      toast({ title: 'Removed from blacklist', description: 'Portal history updated — the player can appeal again' });
      load();
    } catch {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

  const detected = identifier.trim() ? (isEmail(identifier.trim()) ? 'email' : 'Roblox username') : '';

  return (
    <div className="fixed inset-0 z-[65] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-slate-950 border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 shrink-0">
              <ShieldBan className="h-5 w-5 text-rose-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">Application Blacklist</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 shrink-0"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-slate-400 mb-4">Blacklisted users cannot submit any application forms. If a Roblox username is given, it also appears in their portal history and they can appeal it.</p>

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3 mb-4">
          <div className="relative">
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or Roblox username" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-24" onKeyDown={(e) => e.key === 'Enter' && add()} autoFocus />
            {detected && (
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded-full border ${detected === 'email' ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300' : 'bg-violet-500/10 border-violet-500/25 text-violet-300'}`}>
                {detected === 'email' ? 'Email' : 'Roblox user'}
              </span>
            )}
          </div>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button onClick={add} disabled={adding} className="w-full bg-rose-600 hover:bg-rose-500 text-white border-0">
            {adding ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />} Add to blacklist
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl bg-white/[0.02] border border-white/10 py-8 text-center">
            <Ban className="h-6 w-6 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No one is blacklisted yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <Ban className="h-4 w-4 text-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{e.identifier}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {e.roblox_username && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center gap-1"><UserSearch className="h-2.5 w-2.5" /> In portal history</span>}
                    {e.reason && <span className="text-xs text-slate-500 truncate">{e.reason}</span>}
                  </div>
                  {e.banned_by && <div className="text-[10px] text-slate-600 mt-0.5">by {e.banned_by}</div>}
                </div>
                <button onClick={() => remove(e)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 shrink-0" title="Remove & repeal"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}