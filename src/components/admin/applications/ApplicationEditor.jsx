import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Save, Plus, FileText, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QuestionEditor from './QuestionEditor';
import ApplicationAdvancedSettings from './ApplicationAdvancedSettings';
import ApplicationBasicSettings from './ApplicationBasicSettings';
import ApplicationFormSettings from './ApplicationFormSettings';
import AiApplicationGenerator from './AiApplicationGenerator';
import { defaultQuestion, defaultSettings } from '@/lib/applicationTypes';
import { generateSlug } from '@/lib/applicationSlug';
import { safeParse } from '@/lib/safeParse';

const SETTINGS_SECTIONS = [
  { id: 'sec-general', label: 'General' },
  { id: 'sec-responses', label: 'Responses' },
  { id: 'sec-access', label: 'Access & Limits' },
];

export default function ApplicationEditor({ open, onClose, application, onSave }) {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState(defaultSettings());
  const [tab, setTab] = useState('questions');
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const skipDirty = useRef(true);
  const settingsScrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const a = application || {};
    setForm({ title: a.title || '', description: a.description || '', icon: a.icon || '📋', status: a.status || 'draft', category: a.category || 'General', success_message: a.success_message || '', auto_close_at: a.auto_close_at || '' });
    setQuestions(safeParse(a.questions, []));
    setSettings({ ...defaultSettings(), ...safeParse(a.settings, {}) });
    setTab('questions');
    skipDirty.current = true;
    setDirty(false);
  }, [application, open]);

  useEffect(() => {
    if (!open) return;
    if (skipDirty.current) { skipDirty.current = false; return; }
    setDirty(true);
  }, [form, questions, settings]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  if (!open) return null;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addQuestion = (afterIndex = questions.length - 1, base) => {
    const q = { ...(base || defaultQuestion()), id: defaultQuestion().id };
    const next = [...questions];
    next.splice(afterIndex + 1, 0, q);
    setQuestions(next);
    setActiveId(q.id);
  };
  const updateQuestion = (id, updates) => setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  const moveQuestion = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[i], next[j]] = [next[j], next[i]];
    setQuestions(next);
  };
  const activeIndex = questions.findIndex((q) => q.id === activeId);

  const save = async () => {
    if (!form.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (questions.length === 0) { toast({ title: 'Add at least one question', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      // Generate a unique slug from the title
      let slug = generateSlug(form.title);
      const existing = await base44.entities.Application.filter({ slug }, { limit: 5 });
      const conflicts = (existing?.items || []).filter((a) => a.id !== application?.id);
      if (conflicts.length) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

      const data = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        success_message: form.success_message.trim(),
        auto_close_at: form.auto_close_at || null,
        questions: JSON.stringify(questions.filter((q) => q.text.trim())),
        settings: JSON.stringify(settings),
        slug,
      };
      if (application) await base44.entities.Application.update(application.id, data);
      else await base44.entities.Application.create(data);
      toast({ title: application ? 'Application updated' : 'Application created' });
      setDirty(false);
      onSave();
      onClose();
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (dirty && !confirm('You have unsaved changes. Close anyway?')) return;
    onClose();
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabCls = (t) => `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-3 sm:px-5 pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={handleClose} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 shrink-0"><X className="h-5 w-5" /></button>
            <FileText className="h-5 w-5 text-cyan-400 shrink-0 hidden sm:block" />
            <span className="font-display font-semibold text-white truncate text-sm sm:text-base">{form.title || 'Untitled form'}</span>
            {dirty && <span className="ml-2 hidden sm:inline-flex items-center gap-1 text-xs text-amber-300 shrink-0"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved</span>}
          </div>
          <div className="flex items-center gap-2">
            <AiApplicationGenerator
              isEditing={!!application}
              existingForm={{ title: form.title, description: form.description, questions }}
              onGenerate={(data) => {
                setForm((f) => ({
                  ...f,
                  title: data.mode === 'append' ? f.title : data.title,
                  description: data.mode === 'append' ? f.description : data.description,
                  icon: data.mode === 'append' ? f.icon : data.icon,
                  category: data.mode === 'append' ? f.category : data.category,
                  success_message: data.mode === 'append' ? f.success_message : data.success_message,
                }));
                setQuestions((prev) => data.mode === 'append' ? [...prev, ...data.questions] : data.questions);
              }}
            />
            <Button size="sm" onClick={save} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shrink-0">
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <button className={tabCls('questions')} onClick={() => setTab('questions')}>Questions</button>
          <button className={tabCls('settings')} onClick={() => setTab('settings')}>Settings</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-6">
        {tab === 'questions' ? (
          <div className="flex gap-3 items-start">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                <div className="h-2 bg-cyan-500" />
                <div className="p-6 space-y-2">
                  <input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Untitled form"
                    className="w-full bg-transparent border-0 border-b border-white/10 focus:border-cyan-400 outline-none font-display text-3xl text-white placeholder:text-slate-500 py-2" />
                  <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Form description" rows={2}
                    className="w-full resize-none bg-transparent border-0 border-b border-white/10 focus:border-cyan-400 outline-none text-sm text-slate-300 placeholder:text-slate-500 py-2" />
                  <p className="text-xs text-slate-500 pt-2">Applicants sign in with their portal account. <button onClick={() => setTab('settings')} className="text-cyan-400 hover:underline">Change settings</button></p>
                </div>
              </div>
              {questions.map((q, i) => (
                <QuestionEditor key={q.id} question={q} index={i} total={questions.length} active={q.id === activeId}
                  onFocus={() => setActiveId(q.id)} onUpdate={updateQuestion}
                  onRemove={() => setQuestions(questions.filter((x) => x.id !== q.id))}
                  onDuplicate={() => addQuestion(i, q)}
                  onMoveUp={() => moveQuestion(i, -1)} onMoveDown={() => moveQuestion(i, 1)} />
              ))}
              {questions.length === 0 && (
                <button onClick={() => addQuestion()} className="w-full rounded-xl border border-dashed border-white/10 py-10 text-sm text-slate-500 hover:text-slate-300 hover:border-white/20">
                  <Plus className="h-5 w-5 mx-auto mb-1" /> Add your first question
                </button>
              )}
            </div>
            <div className="sticky top-32 rounded-xl bg-white/[0.03] border border-white/10 p-1">
              <button onClick={() => addQuestion(activeIndex === -1 ? questions.length - 1 : activeIndex)} title="Add question" className="p-2.5 rounded-lg text-slate-300 hover:bg-white/10"><Plus className="h-5 w-5" /></button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-[200px_1fr] gap-6">
            <div className="hidden md:block">
              <div className="sticky top-24 space-y-0.5">
                {SETTINGS_SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => scrollToSection(s.id)} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div id="sec-general"><ApplicationBasicSettings form={form} setField={setField} /></div>
              <div id="sec-responses"><ApplicationFormSettings settings={settings} update={(k, v) => setSettings((s) => ({ ...s, [k]: v }))} /></div>
              <div id="sec-access"><ApplicationAdvancedSettings settings={settings} update={(k, v) => setSettings((s) => ({ ...s, [k]: v }))} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}