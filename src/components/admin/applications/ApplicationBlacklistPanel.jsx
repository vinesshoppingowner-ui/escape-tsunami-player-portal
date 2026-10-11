import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Ban, Trash2, Plus, X, ShieldBan } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ApplicationBlacklistPanel({ onClose }) {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState('');
  const [newReason, setNewReason] = useState('');
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
    const id = newId.trim();
    if (!id) { toast({ title: 'Enter an email or Roblox username', variant: 'destructive' }); return; }
    setAdding(true);
    try {
      await base44.entities.ApplicationBlacklist.create({
        identifier: id.toLowerCase(),
        reason: newReason.trim(),
      });
      toast({ title: 'Blacklisted', description: `${id} can no longer submit applications` });
      setNewId('');
      setNewReason('');
      load();
    } catch (e) {
      toast({ title: 'Failed to blacklist', description: e.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const remove = async (entry) => {
    try {
      await base44.entities.ApplicationBlacklist.delete(entry.id);
      toast({ title: 'Removed from blacklist' });
      load();
    } catch {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

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
        <p className="text-sm text-slate-400 mb-4">Blacklisted users cannot submit any application forms. Add by email or Roblox username.</p>

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3 mb-4">
          <Input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Email or Roblox username" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
          <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Reason (optional)" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
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
                  {e.reason && <div className="text-xs text-slate-500 truncate">{e.reason}</div>}
                  {e.banned_by && <div className="text-[10px] text-slate-600">by {e.banned_by}</div>}
                </div>
                <button onClick={() => remove(e)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 shrink-0" title="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}