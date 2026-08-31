import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Gavel } from 'lucide-react';

const STATUSES = ['Pending', 'Under Review', 'Approved', 'Denied'];

export default function AppealsTab() {
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

  const draftFor = (a) => drafts[a.id] || { status: a.status, staff_response: a.staff_response || '' };
  const setDraft = (id, patch) =>
    setDrafts((d) => ({ ...d, [id]: { ...draftFor({ id }), ...patch } }));

  const save = async (appeal) => {
    const draft = draftFor(appeal);
    setSavingId(appeal.id);
    try {
      await base44.entities.Appeal.update(appeal.id, {
        status: draft.status,
        staff_response: draft.staff_response,
      });
      if (draft.status === 'Approved') {
        const mod = modFor(appeal.moderation_id);
        if (mod && mod.status !== 'Repealed') {
          await base44.entities.Moderation.update(mod.id, { status: 'Repealed' });
        }
      }
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
        return (
          <div key={a.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-slate-500">{new Date(a.created_date).toLocaleString()}</div>
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
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Staff response (shown to player)</label>
                <Textarea
                  rows={2}
                  value={draft.staff_response}
                  onChange={(e) => setDraft(a.id, { staff_response: e.target.value })}
                  className="bg-slate-950/60 border-white/15 text-white"
                  placeholder="Explain the decision…"
                />
              </div>
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