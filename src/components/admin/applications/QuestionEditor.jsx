import { Circle, Square, Copy, Trash2, X, ChevronUp, ChevronDown, GitBranch, ShieldCheck, Play } from 'lucide-react';
import { QUESTION_TYPES, extractYouTubeId } from '@/lib/applicationTypes';
import FormToggle from './FormToggle';

const lineInput = 'w-full bg-transparent border-0 border-b border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-slate-500 py-2 transition-colors';
const PREVIEW = { text: 'Short answer text', textarea: 'Long answer text', number: 'Number', email: 'Email address', date: 'Month, day, year', rating: '★ ★ ★ ★ ★', yesno: 'Yes / No', file: '📎 Click to upload', code: 'const x = "code snippet"', youtube: '▶ YouTube Video (watch or submit link)' };

export default function QuestionEditor({ question, allQuestions = [], index, total, active, onFocus, onUpdate, onRemove, onDuplicate, onMoveUp, onMoveDown }) {
  const update = (field, value) => onUpdate(question.id, { [field]: value });
  const opts = question.options || [];
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(question.type);
  const OptIcon = question.type === 'checkbox' ? Square : Circle;
  const setOpt = (i, v) => update('options', opts.map((o, idx) => (idx === i ? v : o)));

  return (
    <div onClick={onFocus} className={`relative rounded-xl bg-white/[0.03] border border-white/10 p-5 transition-shadow ${active ? 'shadow-lg shadow-black/30' : ''}`}>
      {active && <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-cyan-500" />}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={question.text} onChange={(e) => update('text', e.target.value)} placeholder={`Question ${index + 1}`}
          className={`flex-1 rounded-t-md px-3 ${active ? 'bg-white/5' : ''} ${lineInput} text-base`} />
        {active && (
          <select value={question.type} onChange={(e) => update('type', e.target.value)}
            className="sm:w-52 h-11 rounded-md bg-slate-950 border border-white/10 text-sm text-slate-200 px-3">
            {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        )}
      </div>
      {(active || question.description) && (
        <input value={question.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="Description (optional)" className={`${lineInput} text-sm mt-2 px-3`} />
      )}

      <div className="mt-4 px-3">
        {hasOptions ? (
          <div className="space-y-1">
            {opts.map((o, i) => (
              <div key={i} className="flex items-center gap-3">
                {question.type === 'dropdown' ? <span className="w-4 text-xs text-slate-500">{i + 1}.</span> : <OptIcon className="h-4 w-4 text-slate-500 shrink-0" />}
                <input value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} className={`${lineInput} text-sm`} />
                {active && <button onClick={() => update('options', opts.filter((_, idx) => idx !== i))} className="p-1 text-slate-500 hover:text-rose-400"><X className="h-4 w-4" /></button>}
              </div>
            ))}
            {active && (
              <button onClick={() => update('options', [...opts, ''])} className="flex items-center gap-3 py-2 text-sm text-slate-500 hover:text-slate-300">
                <OptIcon className="h-4 w-4" /> Add option
              </button>
            )}
          </div>
        ) : question.type === 'youtube' ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-rose-400" />
                Embedded YouTube Video URL <span className="text-slate-600">(optional — leave blank if applicant submits a YouTube link)</span>
              </label>
              <input
                value={question.youtubeUrl || ''}
                onChange={(e) => update('youtubeUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`${lineInput} text-sm mt-1`}
              />
            </div>
            {extractYouTubeId(question.youtubeUrl) ? (
              <div className="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(question.youtubeUrl)}`}
                  title={question.text || 'YouTube video'}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-xs text-slate-500 border-b border-dotted border-white/10 py-2">
                {PREVIEW.youtube}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500 border-b border-dotted border-white/10 py-2 w-2/3">{PREVIEW[question.type]}</div>
        )}
      </div>

      {active && (
        <>
        {(question.type === 'file' || question.showIf || question.validation) && (
          <div className="mt-4 space-y-2">
            {question.type === 'file' && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Allowed: {(question.fileTypes || []).join(', ')}</span>
                <span>·</span>
                <span>Max: {question.maxFileSize || 5}MB</span>
              </div>
            )}
            {question.showIf && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-300">
                <GitBranch className="h-3 w-3" /> Shown only when "{question.showIf.questionId}" {question.showIf.operator} "{question.showIf.value}"
              </div>
            )}
            {question.validation?.pattern && (
              <div className="flex items-center gap-1.5 text-xs text-violet-300">
                <ShieldCheck className="h-3 w-3" /> Pattern: /{question.validation.pattern}/
              </div>
            )}
          </div>
        )}
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300 select-none flex items-center gap-1">
            <GitBranch className="h-3 w-3" /> Conditional logic & validation
          </summary>
          <div className="mt-3 space-y-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
            {/* Conditional logic */}
            <div>
              <label className="text-xs font-medium text-slate-400">Show this question only when:</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <select
                  value={question.showIf?.questionId || ''}
                  onChange={(e) => update('showIf', e.target.value ? { questionId: e.target.value, operator: 'equals', value: '' } : null)}
                  className="h-9 rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2 flex-1 min-w-[120px]"
                >
                  <option value="">Always show</option>
                  {allQuestions
                    .filter((oq) => oq.id !== question.id)
                    .map((oq, idx) => (
                      <option key={oq.id} value={oq.id}>
                        Q{idx + 1}: {(oq.text || 'Untitled').slice(0, 40)}
                      </option>
                    ))}
                </select>
                <select
                  value={question.showIf?.operator || 'equals'}
                  onChange={(e) => question.showIf && update('showIf', { ...question.showIf, operator: e.target.value })}
                  disabled={!question.showIf}
                  className="h-9 rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                >
                  <option value="equals">equals</option>
                  <option value="notEquals">does not equal</option>
                  <option value="contains">contains</option>
                  <option value="filled">is filled</option>
                  <option value="empty">is empty</option>
                </select>
                {question.showIf && !['filled', 'empty'].includes(question.showIf.operator) && (
                  <input
                    value={question.showIf.value || ''}
                    onChange={(e) => update('showIf', { ...question.showIf, value: e.target.value })}
                    placeholder="value"
                    className="h-9 flex-1 min-w-[100px] rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                  />
                )}
              </div>
            </div>
            {/* Validation */}
            {['text', 'textarea', 'number'].includes(question.type) && (
              <div>
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Validation</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {['text', 'textarea'].includes(question.type) && (
                    <>
                      <input
                        type="number"
                        value={question.validation?.minLength || ''}
                        onChange={(e) => update('validation', { ...question.validation, minLength: Number(e.target.value) || undefined })}
                        placeholder="min chars"
                        className="h-9 w-20 rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                      />
                      <input
                        type="number"
                        value={question.validation?.maxLength || ''}
                        onChange={(e) => update('validation', { ...question.validation, maxLength: Number(e.target.value) || undefined })}
                        placeholder="max chars"
                        className="h-9 w-20 rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                      />
                    </>
                  )}
                  <input
                    value={question.validation?.pattern || ''}
                    onChange={(e) => update('validation', { ...question.validation, pattern: e.target.value })}
                    placeholder="regex pattern (e.g. ^https?://)"
                    className="h-9 flex-1 min-w-[140px] rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                  />
                  <input
                    value={question.validation?.patternMessage || ''}
                    onChange={(e) => update('validation', { ...question.validation, patternMessage: e.target.value })}
                    placeholder="error message"
                    className="h-9 flex-1 min-w-[120px] rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                  />
                </div>
              </div>
            )}
            {/* File settings */}
            {question.type === 'file' && (
              <div>
                <label className="text-xs font-medium text-slate-400">File settings</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <input
                    value={(question.fileTypes || []).join(', ')}
                    onChange={(e) => update('fileTypes', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="pdf, docx, png"
                    className="h-9 flex-1 min-w-[140px] rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                  />
                  <input
                    type="number"
                    value={question.maxFileSize || 5}
                    onChange={(e) => update('maxFileSize', Number(e.target.value) || 5)}
                    className="h-9 w-20 rounded-md bg-slate-950 border border-white/10 text-xs text-slate-200 px-2"
                  />
                  <span className="text-xs text-slate-500 self-center">MB max</span>
                </div>
              </div>
            )}
          </div>
        </details>
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-1">
          <button onClick={onMoveUp} disabled={index === 0} title="Move up" className="p-2 rounded-md text-slate-400 hover:bg-white/5 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} title="Move down" className="p-2 rounded-md text-slate-400 hover:bg-white/5 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
          <button onClick={onDuplicate} title="Duplicate" className="p-2 rounded-md text-slate-400 hover:bg-white/5"><Copy className="h-4 w-4" /></button>
          <button onClick={onRemove} title="Delete" className="p-2 rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
          <span className="mx-2 h-6 w-px bg-white/10" />
          <span className="text-sm text-slate-300 mr-2">Required</span>
          <FormToggle checked={question.required} onChange={(v) => update('required', v)} />
        </div>
        </>
      )}
    </div>
  );
}