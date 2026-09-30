import { Circle, Square, Copy, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { QUESTION_TYPES } from '@/lib/applicationTypes';
import FormToggle from './FormToggle';

const lineInput = 'w-full bg-transparent border-0 border-b border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-slate-500 py-2 transition-colors';
const PREVIEW = { text: 'Short answer text', textarea: 'Long answer text', number: 'Number', email: 'Email address', date: 'Month, day, year', rating: '★ ★ ★ ★ ★', yesno: 'Yes / No' };

export default function QuestionEditor({ question, index, total, active, onFocus, onUpdate, onRemove, onDuplicate, onMoveUp, onMoveDown }) {
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
        ) : (
          <div className="text-sm text-slate-500 border-b border-dotted border-white/10 py-2 w-2/3">{PREVIEW[question.type]}</div>
        )}
      </div>

      {active && (
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-1">
          <button onClick={onMoveUp} disabled={index === 0} title="Move up" className="p-2 rounded-md text-slate-400 hover:bg-white/5 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} title="Move down" className="p-2 rounded-md text-slate-400 hover:bg-white/5 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
          <button onClick={onDuplicate} title="Duplicate" className="p-2 rounded-md text-slate-400 hover:bg-white/5"><Copy className="h-4 w-4" /></button>
          <button onClick={onRemove} title="Delete" className="p-2 rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
          <span className="mx-2 h-6 w-px bg-white/10" />
          <span className="text-sm text-slate-300 mr-2">Required</span>
          <FormToggle checked={question.required} onChange={(v) => update('required', v)} />
        </div>
      )}
    </div>
  );
}