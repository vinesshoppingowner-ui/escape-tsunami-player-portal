import { useState } from 'react';
import { Copy, Check, Clock, FileText, Search, ThumbsUp, Flag } from 'lucide-react';
import { formatAnswer, extractYouTubeId } from '@/lib/applicationTypes';
import UploadedFileAttachment from '@/components/apply/UploadedFileAttachment';

export default function ResponseAnswers({ questions, answers }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'required' | 'flagged'
  const [searchQuery, setSearchQuery] = useState('');
  const [marks, setMarks] = useState({}); // { [questionId]: 'good' | 'flag' }
  const [copied, setCopied] = useState(false);

  const totalWords = questions.reduce((sum, q) => {
    const a = formatAnswer(q, answers[q.id]);
    return sum + (a ? a.split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  const readMins = Math.max(1, Math.ceil(totalWords / 200));
  const answeredCount = questions.filter((q) => formatAnswer(q, answers[q.id])).length;
  const goodCount = Object.values(marks).filter((v) => v === 'good').length;
  const flagCount = Object.values(marks).filter((v) => v === 'flag').length;

  const toggleMark = (qId, type) => {
    setMarks((prev) => ({ ...prev, [qId]: prev[qId] === type ? undefined : type }));
  };

  const copyAll = () => {
    const text = questions
      .map((q, i) => {
        const markLabel = marks[q.id] === 'good' ? ' [✓ GOOD]' : marks[q.id] === 'flag' ? ' [⚑ FLAGGED]' : '';
        return `Q${i + 1}: ${q.text}${markLabel}\nA: ${formatAnswer(q, answers[q.id]) || '(No answer)'}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const visible = questions.filter((q) => {
    if (filterMode === 'required' && !q.required) return false;
    if (filterMode === 'flagged' && marks[q.id] !== 'flag') return false;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const a = formatAnswer(q, answers[q.id]) || '';
      return (q.text || '').toLowerCase().includes(term) || a.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-cyan-400" /> {answeredCount}/{questions.length} answered · {totalWords} words</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-violet-400" /> ~{readMins} min read</span>
            {goodCount > 0 && <span className="text-emerald-300 font-medium">✓ {goodCount} strong</span>}
            {flagCount > 0 && <span className="text-rose-300 font-medium">⚑ {flagCount} flagged</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {[['all', 'All'], ['required', 'Required'], ['flagged', `Flagged (${flagCount})`]].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  filterMode === mode ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy all'}
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter questions or search inside applicant's answers…"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
          />
        </div>
      </div>

      {visible.map((q) => {
        const origIdx = questions.findIndex((item) => item.id === q.id);
        const rawVal = answers[q.id];
        const a = formatAnswer(q, rawVal);
        const isFileUpload = typeof rawVal === 'string' && rawVal.startsWith('file:');
        const mark = marks[q.id];
        return (
          <div
            key={q.id}
            className={`rounded-xl border p-4 transition-colors ${
              mark === 'good'
                ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                : mark === 'flag'
                ? 'bg-rose-500/[0.04] border-rose-500/30'
                : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300 text-[11px] font-bold shrink-0">{origIdx + 1}</span>
                <div className="text-sm text-slate-300 font-medium leading-snug">
                  {q.text}
                  {q.required && <span className="text-rose-400 ml-0.5">*</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleMark(q.id, 'good')}
                  title="Mark answer as strong"
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    mark === 'good'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-emerald-300'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleMark(q.id, 'flag')}
                  title="Flag answer for concern"
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    mark === 'flag'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-rose-300'
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isFileUpload ? (
              <div className="pl-8 mt-2">
                <UploadedFileAttachment value={rawVal} />
              </div>
            ) : a ? (
              <div className="pl-8 space-y-2">
                {q.type === 'code' ? (
                  <pre className="text-xs sm:text-sm text-emerald-300 bg-slate-950/80 border border-white/10 rounded-xl p-3.5 font-mono whitespace-pre-wrap break-words overflow-x-auto">{a}</pre>
                ) : (
                  <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">{a}</div>
                )}
                {q.type === 'youtube' && extractYouTubeId(a) && (
                  <div className="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(a)}`}
                      title={q.text || 'Submitted YouTube video'}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-600 italic pl-8">No answer</div>
            )}

            {a && !isFileUpload && ['textarea', 'text', 'code'].includes(q.type) && (
              <div className="pl-8 mt-1.5 text-[10px] text-slate-500">
                {a.split(/\s+/).filter(Boolean).length} words · {a.length} chars
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}