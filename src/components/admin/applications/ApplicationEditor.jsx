import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Save, Settings, FileText, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QuestionEditor from './QuestionEditor';
import ApplicationAdvancedSettings from './ApplicationAdvancedSettings';
import { defaultQuestion, defaultSettings } from '@/lib/applicationTypes';

const ICONS = ['📋', '📝', '🎯', '🏆', '⭐', '🎤', '🎨', '🎮', '🛡️', '💬', '📢', '🎪', '🎓', '💼', '🚀', '⚡', '🔥', '💎', '🌟', '🎭'];

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function ApplicationEditor({ open, onClose, application, onSave }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📋');
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState('General');
  const [successMessage, setSuccessMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState(defaultSettings());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (application) {
      setTitle(application.title || '');
      setDescription(application.description || '');
      setIcon(application.icon || '📋');
      setStatus(application.status || 'draft');
      setCategory(application.category || 'General');
      setSuccessMessage(application.success_message || '');
      setQuestions(JSON.parse(application.questions || '[]'));
      setSettings({ ...defaultSettings(), ...JSON.parse(application.settings || '{}') });
    } else {
      setTitle(''); setDescription(''); setIcon('📋'); setStatus('draft');
      setCategory('General'); setSuccessMessage(''); setQuestions([]); setSettings(defaultSettings());
    }
  }, [application, open]);

  if (!open) return null;

  const addQuestion = () => setQuestions([...questions, defaultQuestion()]);
  const updateQuestion = (id, updates) => setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  const removeQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));
  const moveQuestion = (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const newQ = [...questions];
    [newQ[index], newQ[newIndex]] = [newQ[newIndex], newQ[index]];
    setQuestions(newQ);
  };
  const updateSetting = (key, value) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    if (!title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (questions.length === 0) { toast({ title: 'Add at least one question', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        icon, status, category,
        success_message: successMessage.trim(),
        questions: JSON.stringify(questions.filter((q) => q.text.trim())),
        settings: JSON.stringify(settings),
      };
      if (application) {
        await base44.entities.Application.update(application.id, data);
        toast({ title: 'Application updated' });
      } else {
        await base44.entities.Application.create(data);
        toast({ title: 'Application created' });
      }
      onSave();
      onClose();
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border-x border-white/10 min-h-screen">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            {application ? 'Edit Application' : 'Create Application'}
          </h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Settings */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Settings className="h-4 w-4" /> Basic Settings
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Staff Team Application" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell applicants what this form is about..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400 mb-1.5 block">Icon</Label>
                <div className="flex flex-wrap gap-1">
                  {ICONS.map((emo) => (
                    <button key={emo} onClick={() => setIcon(emo)} className={`h-8 w-8 rounded-lg text-lg flex items-center justify-center transition-colors ${icon === emo ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>{emo}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 mb-1.5 block">Status</Label>
                <div className="flex gap-1.5">
                  {['draft', 'open', 'closed'].map((s) => (
                    <button key={s} onClick={() => setStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${status === s ? (s === 'open' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : s === 'closed' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-slate-500/15 text-slate-300 border border-slate-500/30') : 'bg-white/5 text-slate-400 border border-white/10'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Staff, Community, Event" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Success Message (shown after submission)</Label>
              <Input value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} placeholder="Thanks for applying! We'll review your application soon." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <FileText className="h-4 w-4" /> Questions ({questions.length})
              </div>
              <Button size="sm" variant="ghost" onClick={addQuestion} className="text-cyan-300 hover:bg-cyan-500/10">
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Button>
            </div>
            {questions.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.02] border border-dashed border-white/10 py-12 text-center">
                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No questions yet. Click "Add Question" to start building your form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionEditor
                    key={q.id}
                    question={q}
                    index={i}
                    total={questions.length}
                    onUpdate={(id, updates) => updateQuestion(id, updates)}
                    onRemove={() => removeQuestion(q.id)}
                    onMoveUp={() => moveQuestion(i, -1)}
                    onMoveDown={() => moveQuestion(i, 1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <ApplicationAdvancedSettings settings={settings} update={updateSetting} />
        </div>
      </div>
    </div>
  );
}