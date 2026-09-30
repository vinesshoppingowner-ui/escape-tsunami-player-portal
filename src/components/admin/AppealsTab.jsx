import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import AppealReviewModal from '@/components/admin/AppealReviewModal';
import AppealRow from '@/components/admin/appeals/AppealRow';
import AppealsFilters from '@/components/admin/appeals/AppealsFilters';
import AppealsBulkBar from '@/components/admin/appeals/AppealsBulkBar';
import SlaBanner from '@/components/admin/appeals/SlaBanner';
import { PRIORITY_RANK, priorityFor } from '@/components/admin/appeals/appealMeta';
import { applyAppealDecision } from '@/lib/appealDecision';
import { can } from '@/lib/staffPermissions';
import { isOwner } from '@/lib/isOwner';
import { isWebsiteBanAppeal } from '@/lib/banAppealGuard';
import AutoAssignToggle from '@/components/admin/appeals/AutoAssignToggle';
import { unlistedModeration } from '@/lib/unlistedAppeal';

export default function AppealsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appeals, setAppeals] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const isPlayerLocked = (username) => appeals.some((x) => x.roblox_username === username && x.admin_locked);
  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all', type: 'all' });
  const [checked, setChecked] = useState(new Set());
  const [busyIds, setBusyIds] = useState(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);

  const load = async () => {
    const [apps, mods] = await Promise.all([
      base44.entities.Appeal.list('-created_date', 100),
      base44.entities.Moderation.list('-moderation_date', 100),
    ]);
    const admin = user?.role === 'admin' || isOwner(user);
    setAppeals((apps || []).filter((a) => !a.removed && (admin || !isWebsiteBanAppeal(a))));
    setModerations(mods || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const modOf = (a) => moderations.find((m) => m.id === a.moderation_id) || unlistedModeration(a);
  const selected = appeals.find((a) => a.id === selectedId) || null;

  const q = filters.search.trim().toLowerCase();
  const visible = appeals
    .filter((a) => {
      const mod = modOf(a);
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.priority !== 'all' && priorityFor(mod).label !== filters.priority) return false;
      if (filters.type !== 'all' && mod?.moderation_type !== filters.type) return false;
      if (q && ![a.roblox_username, a.appeal_reason, mod?.reason].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = PRIORITY_RANK[priorityFor(modOf(a)).label];
      const pb = PRIORITY_RANK[priorityFor(modOf(b)).label];
      if (pa !== pb) return pa - pb;
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const pendingCount = appeals.filter((a) => a.status === 'Pending').length;
  const allVisibleChecked = visible.length > 0 && visible.every((a) => checked.has(a.id));

  const toggle = (id) => setChecked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setChecked(allVisibleChecked ? new Set() : new Set(visible.map((a) => a.id)));

  const quickAction = async (appeal, status) => {
    setBusyIds((s) => new Set(s).add(appeal.id));
    try {
      await applyAppealDecision({ appeal, moderation: modOf(appeal), user, status });
      await load();
      toast({ title: `Appeal ${status.toLowerCase()}`, description: appeal.roblox_username });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Not allowed', description: e.message });
    }
    setBusyIds((s) => { const n = new Set(s); n.delete(appeal.id); return n; });
  };

  const bulkAction = async (status) => {
    const targets = appeals.filter((a) => checked.has(a.id) && a.status !== status);
    if (!targets.length) return;
    if (['Approved', 'Denied'].includes(status) && !can(user, 'decide_appeals')) {
      toast({ variant: 'destructive', title: 'Not allowed', description: "You don't have permission to approve or deny appeals." });
      return;
    }
    if (!window.confirm(`Set ${targets.length} appeal(s) to "${status}"? Players will be notified.`)) return;
    setBulkRunning(true);
    for (const appeal of targets) {
      await applyAppealDecision({ appeal, moderation: modOf(appeal), user, status });
    }
    await load();
    setChecked(new Set());
    setBulkRunning(false);
    toast({ title: `${targets.length} appeal(s) set to ${status}` });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading appeals…</div>;
  }
  if (!appeals.length) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <div className="text-sm font-medium text-white">All caught up!</div>
        <div className="text-xs text-slate-500 mt-1">No appeals waiting for review right now.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold text-white">Appeals queue</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{appeals.length}</span>
        {pendingCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">{pendingCount} new</span>}
        <span className="text-xs text-slate-500 ml-auto">Sorted by priority · Click to review</span>
        {isOwner(user) && <AutoAssignToggle />}
      </div>

      <SlaBanner appeals={appeals} />

      <AppealsFilters filters={filters} onChange={setFilters} />

      <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
        <Checkbox checked={allVisibleChecked} onCheckedChange={toggleAll} className="border-white/30" />
        <span>Select all shown ({visible.length})</span>
      </div>

      <AppealsBulkBar count={checked.size} running={bulkRunning} onAction={bulkAction} onClear={() => setChecked(new Set())} />

      {visible.length === 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-12 text-center text-sm text-slate-400">
          No appeals match your filters.
        </div>
      )}

      {visible.map((a) => (
        <AppealRow
          key={a.id}
          appeal={a}
          moderation={modOf(a)}
          checked={checked.has(a.id)}
          onToggle={() => toggle(a.id)}
          onOpen={() => setSelectedId(a.id)}
          playerLocked={isPlayerLocked(a.roblox_username)}
          busy={busyIds.has(a.id) || bulkRunning}
          onAction={(status) => quickAction(a, status)}
        />
      ))}

      <AppealReviewModal
        open={!!selected}
        onClose={() => setSelectedId(null)}
        playerLocked={selected ? isPlayerLocked(selected.roblox_username) : false}
        appeal={selected}
        moderation={selected ? modOf(selected) : null}
        onSaved={load}
      />
    </div>
  );
}