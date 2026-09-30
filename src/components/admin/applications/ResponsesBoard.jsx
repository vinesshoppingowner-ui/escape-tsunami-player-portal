import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronLeft, Users, Search, Sparkles, Download } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { useToast } from '@/components/ui/use-toast';
import { RESPONSE_STATUS, formatAnswer } from '@/lib/applicationTypes';
import { runAIReview } from '@/lib/applicationAI';
import { downloadCsv } from '@/lib/csv';
import ResponseListItem from './ResponseListItem';
import ResponseViewer from './ResponseViewer';
import ResponseStats from './ResponseStats';
import ResponseBulkBar from './ResponseBulkBar';
import AppIcon from '@/components/apply/AppIcon';
import { RESPONSE_TAGS } from '@/lib/applicationTypes';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'score', label: 'Highest AI score' },
  { value: 'score_low', label: 'Lowest AI score' },
  { value: 'rating', label: 'Highest staff rating' },
];
const TAG_OPTS = [{ value: 'all', label: 'All tags' }, { value: 'starred', label: '★ Shortlisted' }, ...RESPONSE_TAGS.map((t) => ({ value: t, label: t }))];

export default function ResponsesBoard({ app, onBack }) {
  const { toast } = useToast();
  const [responses, setResponses] = useState(null);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [openIdx, setOpenIdx] = useState(null);
  const [bulk, setBulk] = useState(null);
  const [tag, setTag] = useState('all');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    base44.entities.ApplicationResponse.filter({ application_id: app.id }, '-created_date', 500).then((r) => setResponses(r || []));
  }, [app.id]);

  if (!responses) return <div className="flex items-center justify-center py-12 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading responses…</div>;

  const questions = JSON.parse(app.questions || '[]');
  const replace = (u) => setResponses((rs) => rs.map((r) => (r.id === u.id ? u : r)));
  const score = (r) => r.ai_score ?? -1;
  const shown = responses
    .filter((r) => (tag === 'all' || (tag === 'starred' ? r.starred : (r.tags || []).includes(tag))))
    .filter((r) => (tab === 'all' || r.status === tab) && (!q || [r.roblox_username, r.submitted_by_email, r.answers].some((v) => v?.toLowerCase().includes(q.toLowerCase()))))
    .sort((a, b) => sort === 'oldest' ? new Date(a.created_date) - new Date(b.created_date)
      : sort === 'rating' ? (b.staff_rating || 0) - (a.staff_rating || 0)
      : sort === 'score' ? score(b) - score(a) : sort === 'score_low' ? score(a) - score(b)
      : new Date(b.created_date) - new Date(a.created_date));
  const unchecked = responses.filter((r) => r.ai_score === undefined || r.ai_score === null);

  const bulkAI = async () => {
    for (let i = 0; i < unchecked.length; i++) {
      setBulk(`${i + 1}/${unchecked.length}`);
      const r = unchecked[i];
      const fields = await runAIReview(app, JSON.parse(r.answers || '{}')).catch(() => null);
      if (fields) replace(await base44.entities.ApplicationResponse.update(r.id, fields));
    }
    setBulk(null);
    toast({ title: 'AI check finished' });
  };

  const exportCsv = () => downloadCsv(`${app.title}-responses.csv`, shown.map((r) => {
    const a = JSON.parse(r.answers || '{}');
    return { user: r.roblox_username, email: r.submitted_by_email, status: r.status, attempt: r.attempt || 1, ai: r.ai_score ?? '', date: new Date(r.created_date).toLocaleString(), ...Object.fromEntries(questions.map((qq) => [qq.id, formatAnswer(qq, a[qq.id])])) };
  }), [{ key: 'user', label: 'Roblox' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Status' }, { key: 'attempt', label: 'Attempt' }, { key: 'ai', label: 'AI score' }, { key: 'date', label: 'Submitted' }, ...questions.map((qq) => ({ key: qq.id, label: qq.text }))]);

  const btn = 'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium disabled:opacity-50';

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /> Back to applications</button>
      <div className="flex flex-wrap items-center gap-3">
        <AppIcon icon={app.icon} className="h-10 w-10" emojiClass="text-3xl" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-white">{app.title}</h3>
          <p className="text-xs text-slate-500">{responses.length} responses · {app.category}</p>
        </div>
        <button onClick={bulkAI} disabled={!!bulk || !unchecked.length} className={`${btn} bg-violet-500/10 border-violet-500/30 text-violet-200 hover:bg-violet-500/20`}>
          {bulk ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} {bulk ? `Checking ${bulk}` : `AI check ${unchecked.length} unchecked`}
        </button>
        <button onClick={exportCsv} disabled={!shown.length} className={`${btn} bg-white/5 border-white/10 text-slate-300 hover:text-white`}><Download className="h-3.5 w-3.5" /> Export CSV</button>
      </div>

      <ResponseStats responses={responses} />
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {[['all', 'All'], ...Object.entries(RESPONSE_STATUS).map(([k, s]) => [k, s.label])].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === k ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
            {l} <span className="ml-1 text-slate-500">{k === 'all' ? responses.length : responses.filter((r) => r.status === k).length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicant or answers…" className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-900/60 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50" />
        </div>
        <CustomDropdown value={tag} onChange={setTag} options={TAG_OPTS} className="w-44" />
        <CustomDropdown value={sort} onChange={setSort} options={SORTS} className="w-48" />
        {shown.length > 0 && <button onClick={() => setSelected(selected.length === shown.length ? [] : shown.map((r) => r.id))} className="h-9 px-3 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white">{selected.length === shown.length ? 'Deselect all' : 'Select all'}</button>}
      </div>
      {selected.length > 0 && <ResponseBulkBar selected={selected} responses={responses} onClear={() => setSelected([])} onDone={(us) => { us.forEach(replace); setSelected([]); toast({ title: `Updated ${us.length} responses` }); }} />}

      {shown.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 py-12 text-center">
          <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{responses.length ? 'No responses match.' : 'No responses yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">{shown.map((r, i) => <ResponseListItem key={r.id} response={r} onOpen={() => setOpenIdx(i)}
          selected={selected.includes(r.id)}
          onSelect={() => setSelected((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))}
          onStar={async () => replace(await base44.entities.ApplicationResponse.update(r.id, { starred: !r.starred }))} />)}</div>
      )}

      {openIdx !== null && (
        <ResponseViewer responses={shown} index={openIdx} application={app} onIndex={setOpenIdx} onClose={() => setOpenIdx(null)} onUpdate={replace} />
      )}
    </div>
  );
}