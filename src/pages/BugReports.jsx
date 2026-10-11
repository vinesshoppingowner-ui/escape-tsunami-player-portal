import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import SiteNav from '@/components/SiteNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Bug, Send, CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITIES = [
  { value: 'Low', label: 'Low', desc: 'Minor visual or cosmetic issue', cls: 'border-slate-500/30 bg-slate-500/10 text-slate-300' },
  { value: 'Medium', label: 'Medium', desc: 'Feature not working as expected', cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  { value: 'High', label: 'High', desc: 'Significant feature broken', cls: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
  { value: 'Critical', label: 'Critical', desc: 'Site unusable or data loss', cls: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
];

const STATUS_STYLES = {
  'Submitted': { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock, label: 'Submitted' },
  'Confirmed': { cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', icon: CheckCircle2, label: 'Confirmed' },
  'Declined': { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle, label: 'Declined' },
};

export default function BugReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', severity: 'Low' });
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.BugReport.filter({}, { sort: '-created_date', limit: 100 });
        setReports(page?.items || []);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async () => {
    if (!form.title.trim()) { setError('Please enter a title.'); return; }
    if (form.description.trim().length < 10) { setError('Please provide at least 10 characters describing the bug.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const robloxUsername = user?.roblox_username || user?.data?.roblox_username || user?.email || 'Unknown';
      const created = await base44.entities.BugReport.create({
        roblox_username: robloxUsername,
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
      });
      setReports((prev) => [created, ...prev]);
      setForm({ title: '', description: '', severity: 'Low' });
      setShowForm(false);
      setExpandedId(created.id);
      toast({ title: 'Bug report submitted', description: 'Thank you! Our team will review it.' });
    } catch (e) {
      toast({ title: 'Failed to submit', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const severityBadge = (sev) => SEVERITIES.find((s) => s.value === sev) || SEVERITIES[0];

  return (
    <>
      <SiteNav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-24">
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Bug className="h-7 w-7 text-cyan-400" />
            Bug Reports
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Found a bug in the portal? Report it here and track its status. Our team reviews every submission.
          </p>
        </div>

        <Button
          onClick={() => setShowForm((s) => !s)}
          className="mb-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
        >
          {showForm ? <ChevronUp className="h-4 w-4 mr-1" /> : <Bug className="h-4 w-4 mr-1" />}
          {showForm ? 'Cancel' : 'Report a bug'}
        </Button>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief summary of the bug"
                  maxLength={120}
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Steps to reproduce, what you expected, and what actually happened..."
                  rows={5}
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setForm({ ...form, severity: s.value })}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${form.severity === s.value ? s.cls + ' ring-1 ring-cyan-400/40' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'}`}
                    >
                      <span className="font-semibold block">{s.label}</span>
                      <span className="text-[10px] opacity-80">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" /> {error}</div>}

              <div className="flex justify-end">
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                >
                  {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                  {submitting ? 'Submitting…' : 'Submit report'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="h-5 w-5 animate-spin text-cyan-400 mr-2" /> Loading reports…</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/5">
            <Bug className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No bug reports yet. Found a bug? Report it above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const sev = severityBadge(r.severity);
              const status = STATUS_STYLES[r.status] || STATUS_STYLES['Submitted'];
              const StatusIcon = status.icon;
              const expanded = expandedId === r.id;
              return (
                <motion.div
                  key={r.id}
                  layout
                  className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="w-full text-left p-4 flex items-center gap-3"
                  >
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sev.cls}`}>
                      {r.severity}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-white truncate">{r.title}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        {new Date(r.created_date).toLocaleDateString()} · {r.roblox_username}
                      </span>
                    </span>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.cls}`}>
                      <StatusIcon className="h-3 w-3" /> {status.label}
                    </span>
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap mt-2">{r.description}</p>
                        {r.status === 'Confirmed' && <p className="mt-3 text-xs text-cyan-300/80 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Our team has confirmed this bug and is working on a fix.</p>}
                        {r.status === 'Declined' && <p className="mt-3 text-xs text-rose-300/80 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> This report was reviewed and not considered a bug.</p>}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}