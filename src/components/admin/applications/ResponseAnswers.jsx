import { useState, useEffect } from 'react';
import { Copy, Check, Clock, FileText, Search, ThumbsUp, Flag, Sparkles, GitCompare } from 'lucide-react';
import { formatAnswer, extractYouTubeId } from '@/lib/applicationTypes';
import UploadedFileAttachment from '@/components/apply/UploadedFileAttachment';
import NewBadge from '@/components/ui/new-badge';

function getAnswerQualitySignal(q, text) {
  if (!text || !['textarea', 'text'].includes(q.type)) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (q.type === 'textarea') {
    if (words < 5) return { label: 'Very short / Low effort', cls: 'bg-rose-500/15 border-rose-500/30 text-rose-300', kind: 'low' };
    if (words >= 30) return { label: 'Detailed response', cls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', kind: 'high' };
  }
  if (/\b(as an ai|furthermore|moreover|in conclusion|delve into)\b/i.test(text)) {
    return { label: 'Possible AI phrasing', cls: 'bg-amber-500/15 border-amber-500/30 text-amber-300', kind: 'ai' };
  }
  return null;
}

export default function ResponseAnswers({ questions, answers, responseId, previousAttemptAnswers = null }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'required' | 'flagged' | 'low_effort'
  const [searchQuery, setSearchQuery] = useState('');
  const [marks, setMarks] = useState({}); // { [questionId]: 'good' | 'flag' }
  const [copied, setCopied] = useState(false);
  const [showSignals, setShowSignals] = useState(true);
  const [comparePrev, setComparePrev] = useState(false);

  // Reset marks when switching to a different applicant response (Bug 4 fix)
  useEffect(() => {
    setMarks({});
  }, [responseId]);

  const answerableQuestions = questions.filter((q) => q.type !== 'section');
  const totalWords = answerableQuestions.reduce((sum, q) => {
    const a = formatAnswer(q, answers[q.id]);
    return sum + (a ? a.split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  const readMins = Math.max(1, Math.ceil(totalWords / 200));
  const answeredCount = answerableQuestions.filter((q) => formatAnswer(q, answers[q.id])).length;
  const goodCount = Object.values(marks).filter((v) => v === 'good').length;
  const flagCount = Object.values(marks).filter((v) => v === 'flag').length;

  const toggleMark = (qId, type) => {
    setMarks((prev) => ({ ...prev, [qId]: prev[qId] === type ? undefined : type }));
  };

  const copyAll = () => {
    const text = answerableQuestions
      .map((q, i) => {
        const markLabel = marks[q.id] === 'good' ? ' [✓ GOOD]' : marks[q.id] === 'flag' ? ' [⚑ FLAGGED]' : '';
        return `Q${i + 1}: ${q.text}${markLabel}\nA: ${formatAnswer(q, answers[q.id]) || '(No answer)'}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const rubricScore = answerableQuestions.length
    ? Math.round(
        ((goodCount * 1 + Math.max(0, answeredCount - goodCount - flagCount) * 0.7 - flagCount * 0.5) /
          Math.max(1, answerableQuestions.length)) *
          100
      )
    : null;

  const visible = answerableQuestions.filter((q) => {
    if (filterMode === 'required' && !q.required) return false;
    if (filterMode === 'flagged' && marks[q.id] !== 'flag') return false;
    if (filterMode === 'low_effort') {
      const sig = getAnswerQualitySignal(q, formatAnswer(q, answers[q.id]));
      if (!sig || (sig.kind !== 'low' && sig.kind !== 'ai')) return false;
    }
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
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-cyan-400" /> {answeredCount}/{answerableQuestions.length} answered · {totalWords} words
            </span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-violet-400" /> ~{readMins} min read</span>
            {goodCount > 0 && <span className="text-emerald-300 font-medium">✓ {goodCount} strong</span>}
            {flagCount > 0 && <span className="text-rose-300 font-medium">⚑ {flagCount} flagged</span>}
            {(goodCount > 0 || flagCount > 0) && rubricScore !== null && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-semibold">
                Grade: {Math.max(0, Math.min(100, rubricScore))}%
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[['all', 'All'], ['required', 'Required'], ['flagged', `Flagged (${flagCount})`], ['low_effort', 'Low Effort / AI']].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors inline-flex items-center gap-1.5 ${
                  filterMode === mode ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>{label}</span>
                {mode === 'low_effort' && <NewBadge />}
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter questions or search inside applicant's answers…"
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSignals((s) => !s)}
            className={`h-8 px-2.5 rounded-lg border text-xs inline-flex items-center gap-1.5 transition-colors ${
              showSignals ? 'bg-violet-500/15 border-violet-500/30 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Effort Inspector</span>
            <NewBadge />
          </button>

          {previousAttemptAnswers && (
            <button
              type="button"
              onClick={() => setComparePrev((c) => !c)}
              className={`h-8 px-2.5 rounded-lg border text-xs inline-flex items-center gap-1.5 transition-colors ${
                comparePrev ? 'bg-amber-500/15 border-amber-500/35 text-amber-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare w/ Previous Attempt</span>
              <NewBadge />
            </button>
          )}
        </div>
      </div>

      {visible.map((q) => {
        const origIdx = answerableQuestions.findIndex((item) => item.id === q.id);
        const rawVal = answers[q.id];
        const a = formatAnswer(q, rawVal);
        const prevA = previousAttemptAnswers ? formatAnswer(q, previousAttemptAnswers[q.id]) : null;
        const isFileUpload = typeof rawVal === 'string' && rawVal.startsWith('file:');
        const mark = marks[q.id];
        const signal = showSignals && !isFileUpload ? getAnswerQualitySignal(q, a) : null;

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
              <div className="flex items-start gap-2 min-w-0 flex-wrap">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300 text-[11px] font-bold shrink-0">{origIdx + 1}</span>
                <div className="text-sm text-slate-300 font-medium leading-snug">
                  {q.text}
                  {q.required && <span className="text-rose-400 ml-0.5">*</span>}
                </div>
                {signal && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${signal.cls}`}>
                    {signal.label}
                  </span>
                )}
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

            {comparePrev && previousAttemptAnswers && (
              <div className="ml-8 mt-2.5 rounded-lg bg-amber-500/[0.05] border border-amber-500/20 p-2.5 text-xs">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 mb-1">
                  Previous Attempt Answer {prevA === a ? '(Unchanged)' : '(Updated)'}
                </div>
                <div className="text-slate-300 whitespace-pre-wrap">{prevA || '(No answer)'}</div>
              </div>
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