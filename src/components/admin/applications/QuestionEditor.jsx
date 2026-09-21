import { Type, AlignLeft, ChevronDown, ChevronUp, Circle, CheckSquare, Hash, Mail, Calendar, Star, ToggleLeft, Trash2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QUESTION_TYPES } from '@/lib/applicationTypes';

const TYPE_ICONS = { Type, AlignLeft, ChevronDown, Circle, CheckSquare, Hash, Mail, Calendar, Star, ToggleLeft };

export default function QuestionEditor({ question, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const update = (field, value) => onUpdate(question.id, { [field]: value });
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(question.type);

  const addOption = () => update('options', [...(question.options || []), '']);
  const updateOption = (i, val) => {
    const opts = [...(question.options || [])];
    opts[i] = val;
    update('options', opts);
  };
  const removeOption = (i) => update('options', (question.options || []).filter((_, idx) => idx !== i));

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold">{index + 1}</span>
          <span className="text-sm font-medium text-slate-300">Question {index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"><ChevronUp className="h-4 w-4" /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"><ChevronDown className="h-4 w-4" /></button>
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <Input
        value={question.text}
        onChange={(e) => update('text', e.target.value)}
        placeholder="Question text..."
        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
      />
      <Input
        value={question.description || ''}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Description / help text (optional)"
        className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
      />

      <div className="mt-3">
        <Label className="text-xs text-slate-400 mb-1.5 block">Question Type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {QUESTION_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t.icon];
            const active = question.type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => update('type', t.value)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Label className="text-sm text-slate-300">Required</Label>
        <button
          onClick={() => update('required', !question.required)}
          className={`relative h-6 w-11 rounded-full transition-colors ${question.required ? 'bg-cyan-500' : 'bg-white/10'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${question.required ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {hasOptions && (
        <div className="mt-3">
          <Label className="text-xs text-slate-400 mb-1.5 block">Options</Label>
          <div className="space-y-1.5">
            {(question.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
                />
                <button onClick={() => removeOption(i)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={addOption} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mt-1">
              <Plus className="h-3.5 w-3.5" /> Add option
            </button>
          </div>
        </div>
      )}

      {(question.type === 'text' || question.type === 'textarea') && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Placeholder</Label>
            <Input
              value={question.placeholder || ''}
              onChange={(e) => update('placeholder', e.target.value)}
              placeholder="Enter answer..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Max Length (0 = ∞)</Label>
            <Input
              type="number"
              value={question.maxLength || ''}
              onChange={(e) => update('maxLength', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}