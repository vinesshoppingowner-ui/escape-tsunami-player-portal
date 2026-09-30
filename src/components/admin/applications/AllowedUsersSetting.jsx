import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { X, UserCheck } from 'lucide-react';
import Toggle from './FormToggle';

export default function AllowedUsersSetting({ settings, update }) {
  const [val, setVal] = useState('');
  const list = settings.allowedUsers || [];
  const add = () => {
    const items = val.split(/[,\n]/).map((s) => s.trim()).filter((s) => s && !list.includes(s));
    if (items.length) update('allowedUsers', [...list, ...items]);
    setVal('');
  };
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className="text-sm text-slate-300 flex items-center gap-2"><UserCheck className="h-4 w-4" /> Only selected users can apply</Label>
          <p className="text-xs text-slate-500 mt-0.5">Everyone else sees an "invite only" screen.</p>
        </div>
        <Toggle checked={!!settings.restrictToUsers} onChange={(v) => update('restrictToUsers', v)} />
      </div>
      {settings.restrictToUsers && (
        <>
          <div className="flex gap-2">
            <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder="Email or Roblox username (comma separated)" className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50" />
            <button type="button" onClick={add} className="h-9 px-3 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs">Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {list.length === 0 && <p className="text-xs text-amber-300/80">No users added yet, so nobody is restricted until you add someone.</p>}
            {list.map((u) => (
              <span key={u} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200">
                {u}<button type="button" onClick={() => update('allowedUsers', list.filter((x) => x !== u))}><X className="h-3 w-3 text-slate-500 hover:text-rose-300" /></button>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}