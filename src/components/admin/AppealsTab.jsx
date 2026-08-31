import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logStaffAction } from '@/lib/staffLog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Gavel, Lock, FileText } from 'lucide-react';

const STATUSES = ['Pending', 'Under Review', 'Approved', 'Denied'];

const TEMPLATES = [
  { label: 'Standard Reject', text: 'Your appeal has been denied. After reviewing the case, the moderation stands. Please respect the decision.' },
  { label: 'Standard Lift', text: 'Your appeal has been approved and the moderation has been lifted. Welcome back — please follow the rules going forward.' },
  { label: 'Evidence Required', text: 'We need more information to review your appeal. Please reply with any screenshots or context that support your case.' },
];

const priorityFor = (mod) => {
  const t = mod?.moderation_type;
  if (t === 'Permanent Ban' || t === 'Temporary Ban') return { label: 'High', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
  if (t === 'Warning') return { label: 'Low', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  return { label: 'Medium', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
};

export default function AppealsTab() {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [apps, mods] = await Promise.all([
        base44.entities.Appeal.list('-created_date', 100),
        base44.entities.Moderation.list('-moderation_date', 100),
      ]);
      setAppeals(apps || []);
      setModerations(mods || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const modFor = (id) => moderations.find((m) => m.id === id);

  const draftFor = (a) =>
    drafts[a.id] || {
      status: a.status,
      staff_response: a.staff_response || '',
      internal_notes: a.internal_notes || '',
      can_reappeal: a.can_reappeal !== false,
    };
  const setDraft = (id, patch) =>
    setDrafts((d) => ({ ...d, [id]: { ...draftFor({ id }), ...patch } }));

  const save = async (appeal) => {
    const draft = draftFor(appeal);
    const mod = modFor(appeal.moderation_id);
    setSavingId(appeal.id);
    try {
      await base44.entities.Appeal.update(appeal.id, {
        status: draft.status,
        staff_response: draft.staff_response,
        internal_notes: draft.internal_notes,
        can_reappeal: draft.can_reappeal,
      });
      if (draft.status === 'Approved' && mod && mod.status !== 'Repealed') {
        await base44.entities.Moderation.update(mod.id, { status: 'Repealed' });
      }
      await base44.entities.Notification.create({
        roblox_username: appeal.roblox_username,
        title: `Appeal ${draft.status.toLowerCase()}`,
        body: draft.staff_response || `Your appeal for ${mod?.moderation_type || 'your moderation'} has been ${draft.status.toLowerCase()}.`,
        type: 'appeal_decision',
        read: false,
      });
      await logStaffAction(user, 'appeal_decision', appeal.roblox_username, `Set appeal to ${draft.status}${mod ? ` (${mod.moderation_type})` : ''}`);
      await load();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading appeals…</div>;
  }
  if (!appeals.length) {
    return <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-400">No appeals submitted yet.</div>;
  }

  return (
    <div className="space-y-4">
      {appeals.map((a) => {
        const mod = modFor(a.moderation_id);
        const draft = draftFor(a);
        const priority = priorityFor(mod);
        return (
          <div key={a.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">{new Date(a.created_date).toLocaleString()}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priority.cls}`}>
                    {priority.label} priority
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-cyan-300 font-medium">{a.roblox_username}</span>
                  <span className="text-slate-500"> · {mod?.moderation_type || 'Moderation'}</span>
                  {mod?.reason ? <span className="text-slate-500"> — {mod.reason}</span> : null}
                </div>
                <p className="mt-2 text-sm text-slate-300">{a.appeal_reason}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{a.status}</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-48">
                <label className="text-xs text-slate-400 mb-1 block">Decision</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft(a.id, { status: e.target.value })}
                  className="w-full h-9 rounded-md border border-white/15 bg-slate-950/60 px-3 text-sm text-white"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {draft.status === 'Denied' && (
                  <label className="mt-2 flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.can_reappeal}
                      onChange={(e) => setDraft(a.id, { can_reappeal: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-950 accent-cyan-500"
                    />
                    <span>Allow this player to submit a new appeal</span>
                  </label>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Staff response (shown to player)</label>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <select
                      value=""
                      onChange={(e) => {
                        const t = TEMPLATES.find((x) => x.label === e.target.value);
                        if (t) setDraft(a.id, { staff_response: t.text });
                      }}
                      className="h-7 rounded-md border border-white/15 bg-slate-950/60 px-2 text-xs text-slate-300"
                    >
                      <option value="">Templates…</option>
                      {TEMPLATES.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <Textarea
                  rows={2}
                  value={draft.staff_response}
                  onChange={(e) => setDraft(a.id, { staff_response: e.target.value })}
                  className="bg-slate-950/60 border-white/15 text-white"
                  placeholder="Explain the decision…"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" /> Internal notes (staff only — never shown to player)
              </label>
              <Textarea
                rows={2}
                value={draft.internal_notes}
                onChange={(e) => setDraft(a.id, { internal_notes: e.target.value })}
                className="bg-slate-950/60 border-white/10 text-slate-300 placeholder:text-slate-600"
                placeholder="Private context for the mod team, e.g. prior toxicity history…"
              />
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={() => save(a)}
                disabled={savingId === a.id}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                {savingId === a.id ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving</> : <><Gavel className="h-4 w-4 mr-1.5" /> Save decision</>}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}