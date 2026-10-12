import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import SiteNav from '@/components/SiteNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Bug, Send, AlertCircle, Search, X } from 'lucide-react';
import BugReportCard from '@/components/bugreports/BugReportCard';
import BugReportStats from '@/components/bugreports/BugReportStats';

const SEVERITIES = [
  { value: 'Low', label: 'Low', desc: 'Minor visual or cosmetic issue', cls: 'border-slate-500/30 bg-slate-500/10 text-slate-300' },
  { value: 'Medium', label: 'Medium', desc: 'Feature not working as expected', cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  { value: 'High', label: 'High', desc: 'Significant feature broken', cls: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
  { value: 'Critical', label: 'Critical', desc: 'Site unusable or data loss', cls: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
];

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Submitted', label: 'Awaiting' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Declined', label: 'Declined' },
];

export default function BugReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
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
      setFilter('all');
      toast({ title: 'Bug report submitted', description: 'Thank you! Our team will review it.' });
    } catch (e) {
      toast({ title: 'Failed to submit', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const severityBadge = (sev) => SEVERITIES.find((s) => s.value === sev) || SEVERITIES[0];

  const filtered = reports.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.title?.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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

        {!loading && reports.length > 0 && <BugReportStats reports={reports} />}

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Button
            onClick={() => setShowForm((s) => !s)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
          >
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Bug className="h-4 w-4 mr-1" />}
            {showForm ? 'Cancel' : 'Report a bug'}
          </Button>

          {!loading && reports.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.value ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="h-5 w-5 animate-spin text-cyan-400 mr-2" /> Loading reports…</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/5">
            <Bug className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No bug reports yet. Found a bug? Report it above.</p>
          </div>
        ) : (
          <>
            {reports.length > 3 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-500">No reports match your filter.</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <BugReportCard
                    key={r.id}
                    report={r}
                    severityBadge={severityBadge}
                    expanded={expandedId === r.id}
                    onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}