import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Shuffle } from 'lucide-react';

// Admin switch: when on, every new appeal is assigned to the staff member with the lightest open queue.
export default function AutoAssignToggle() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    base44.entities.SiteSettings.list().then((s) => setSettings(s?.[0] || {}));
  }, []);

  const toggle = async (on) => {
    setSettings((s) => ({ ...s, auto_assign_appeals: on }));
    if (settings.id) await base44.entities.SiteSettings.update(settings.id, { auto_assign_appeals: on });
    else setSettings(await base44.entities.SiteSettings.create({ auto_assign_appeals: on }));
  };

  if (!settings) return null;
  return (
    <label className="inline-flex items-center gap-2 text-xs text-slate-300 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer" title="New appeals go to the staff member with the fewest open appeals">
      <Shuffle className="h-3.5 w-3.5 text-cyan-400" /> Auto-assign
      <Switch checked={!!settings.auto_assign_appeals} onCheckedChange={toggle} />
    </label>
  );
}