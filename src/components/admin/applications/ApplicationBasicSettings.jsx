import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import moment from 'moment';
import { APP_ICONS } from '@/lib/appIcons';

const ICONS = ['📋', '📝', '🎯', '🏆', '⭐', '🎤', '🎨', '🎮', '🛡️', '💬', '📢', '🎪', '🎓', '💼', '🚀', '⚡', '🔥', '💎', '🌟', '🎭'];
const STATUS_CLS = { open: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', closed: 'bg-rose-500/15 text-rose-300 border-rose-500/30', draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500';

export default function ApplicationBasicSettings({ form, setField }) {
  const closeValue = form.auto_close_at ? moment(form.auto_close_at).format('YYYY-MM-DDTHH:mm') : '';
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-300"><Settings className="h-4 w-4" /> General</div>
      <div>
        <Label className="text-xs text-slate-400 mb-1.5 block">Status</Label>
        <div className="flex gap-1.5">
          {['draft', 'open', 'closed'].map((s) => (
            <button key={s} type="button" onClick={() => setField('status', s)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border ${form.status === s ? STATUS_CLS[s] : 'bg-white/5 text-slate-400 border-white/10'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-400 mb-1.5 block">Preset Icon</Label>
        <div className="flex flex-wrap gap-1">
          {Object.entries(APP_ICONS).map(([name, Icon]) => {
            const val = `lucide:${name}`;
            return (
              <button key={name} type="button" title={name} onClick={() => setField('icon', val)} className={`h-9 w-9 rounded-lg flex items-center justify-center border ${form.icon === val ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /></button>
            );
          })}
        </div>
        <Label className="text-xs text-slate-400 mt-3 mb-1.5 block">Or Emoji Icon</Label>
        <div className="flex flex-wrap gap-1">
          {ICONS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => setField('icon', emoji)} className={`h-9 w-9 rounded-lg flex items-center justify-center text-base border ${form.icon === emoji ? 'bg-cyan-500/20 border-cyan-500/40 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{emoji}</button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">Category</Label>
          <Input value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="e.g. Staff, Community" className={inputCls} />
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">Auto-close at</Label>
          <Input type="datetime-local" value={closeValue} onChange={(e) => setField('auto_close_at', e.target.value ? new Date(e.target.value).toISOString() : '')} className={inputCls} />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-400 mb-1.5 block">Custom URL Slug</Label>
        <div className="flex items-center rounded-md border border-white/10 bg-white/5 overflow-hidden">
          <span className="px-3 text-xs text-slate-500 select-none border-r border-white/10">/apply/</span>
          <input
            value={form.slug || ''}
            onChange={(e) => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="auto-generated-from-title"
            className="flex-1 h-9 px-3 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-400 mb-1.5 block">Confirmation message</Label>
        <Input value={form.success_message} onChange={(e) => setField('success_message', e.target.value)} placeholder="Thanks for applying! We'll review your application soon." className={inputCls} />
      </div>
    </div>
  );
}