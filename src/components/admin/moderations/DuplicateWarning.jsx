import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Warns staff when the player already has an active punishment of the same type.
export default function DuplicateWarning({ username, type }) {
  const [count, setCount] = useState(0);
  const name = username?.trim();

  useEffect(() => {
    if (!name) { setCount(0); return; }
    const t = setTimeout(() => {
      base44.entities.Moderation.count({
        roblox_username: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        moderation_type: type, status: 'Active',
      }).then(setCount);
    }, 400);
    return () => clearTimeout(t);
  }, [name, type]);

  if (!count) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {name} already has {count} active {type}{count > 1 ? 's' : ''}. Make sure this isn't a duplicate.
    </div>
  );
}