import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bookmark, X, Save } from 'lucide-react';

export default function TemplatePicker({ onPick, current, isAdmin }) {
  const [templates, setTemplates] = useState([]);
  const load = () => base44.entities.ModerationTemplate.list('name', 100).then((t) => setTemplates(t || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const name = window.prompt('Template name (e.g. "Exploiting")', current.reason);
    if (!name?.trim()) return;
    await base44.entities.ModerationTemplate.create({ name: name.trim(), moderation_type: current.moderation_type, reason: current.reason, duration: current.duration || '' });
    load();
  };

  const remove = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this template?')) return;
    await base44.entities.ModerationTemplate.delete(id);
    load();
  };

  if (!templates.length && !isAdmin) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-slate-400"><Bookmark className="h-3.5 w-3.5" /> Templates</div>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button key={t.id} type="button" onClick={() => onPick(t)} className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/[0.04] border border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white">
            {t.name} <span className="text-slate-500">· {t.moderation_type}{t.duration ? ` ${t.duration}` : ''}</span>
            {isAdmin && <X onClick={(e) => remove(e, t.id)} className="h-3 w-3 text-slate-500 hover:text-rose-300" />}
          </button>
        ))}
        {isAdmin && (
          <button type="button" onClick={save} disabled={!current.reason} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-amber-500/40 text-amber-300 disabled:opacity-40">
            <Save className="h-3 w-3" /> Save current as template
          </button>
        )}
      </div>
    </div>
  );
}