import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Plus, Trash2 } from 'lucide-react';

const shortType = (t) => (t === 'Permanent Ban' ? 'Perm' : t === 'Temporary Ban' ? 'Temp ban' : t);

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
      <div className="text-xs text-slate-400">Quick fill</div>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <div key={t.id} className="group relative">
            <button type="button" onClick={() => onPick(t)} className="inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-indigo-500 transition-colors">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              {t.name}
              <span className="text-slate-400 font-normal">({t.duration || shortType(t.moderation_type)})</span>
            </button>
            {isAdmin && (
              <button type="button" onClick={(e) => remove(e, t.id)} title="Delete template" className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-300">
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ))}
        {isAdmin && (
          <button type="button" onClick={save} disabled={!current.reason} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-40">
            <Plus className="h-3.5 w-3.5" /> Save current
          </button>
        )}
      </div>
    </div>
  );
}