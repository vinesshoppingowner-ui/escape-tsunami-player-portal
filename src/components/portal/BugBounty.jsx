import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Bug, Send, CheckCircle2, Clock, XCircle, Award } from 'lucide-react';

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const GOAL = 5;

const STATUS_STYLE = {
  Submitted: { cls: 'bg-slate-500/10 text-slate-300 border-slate-500/20', icon: Clock },
  Confirmed: { cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: CheckCircle2 },
  Declined: { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle },
};

export default function BugBounty({ robloxUsername }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'Low' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setReports((await base44.entities.BugReport.filter({ roblox_username: robloxUsername }, '-created_date', 50)) || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (robloxUsername) load(); }, [robloxUsername]);

  const confirmed = reports.filter((r) => r.status === 'Confirmed').length;
  const progress = Math.min((confirmed / GOAL) * 100, 100);
  const badgeEarned = confirmed >= GOAL;

  const submit = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    try {
      await base44.entities.BugReport.create({
        roblox_username: robloxUsername,
        title: form.title,
        description: form.description,
        severity: form.severity,
        status: 'Submitted',
      });
      setForm({ title: '', description: '', severity: 'Low' });
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
            <Bug className="h-5 w-5 text-fuchsia-300" />
          </span>
          <div>
            <h3 className="font-semibold text-white">Bug Bounty</h3>
            <p className="text-xs text-slate-400">Report bugs → earn the Quality Assurance badge after {GOAL} confirmed.</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)} className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white border-0">
          <Bug className="h-4 w-4 mr-1.5" /> {showForm ? 'Cancel' : 'Report a bug'}
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">{confirmed} / {GOAL} confirmed</span>
          {badgeEarned ? (
            <span className="inline-flex items-center gap-1 text-amber-300 font-medium"><Award className="h-3.5 w-3.5" /> QA badge earned</span>
          ) : (
            <span className="text-slate-500">{GOAL - confirmed} to go</span>
          )}
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-xl bg-slate-950/40 border border-white/10 p-4">
          <div>
            <Label className="text-xs text-slate-400">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Short summary of the bug" className="bg-slate-950/60 border-white/15 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Severity</Label>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-white/15 bg-slate-950/60 px-3 text-sm text-white">
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Description *</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Steps to reproduce, what you expected, what happened" className="bg-slate-950/60 border-white/15 text-white mt-1" />
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={saving || !form.title || !form.description} className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white border-0">
              {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Submitting</> : <><Send className="h-4 w-4 mr-1.5" /> Submit report</>}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-6 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No bug reports yet. Found a glitch? Report it above.</p>
        ) : (
          reports.map((r) => {
            const s = STATUS_STYLE[r.status] || STATUS_STYLE.Submitted;
            const Icon = s.icon;
            return (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-950/30 border border-white/5 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{r.title}</div>
                  <div className="text-xs text-slate-500 truncate">{r.description}</div>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${s.cls}`}>
                  <Icon className="h-3 w-3" /> {r.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}