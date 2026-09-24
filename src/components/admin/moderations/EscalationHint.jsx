import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Loader2 } from 'lucide-react';
import { suggestEscalation } from '@/lib/escalation';

export default function EscalationHint({ username, onApply }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const name = username.trim();
    setSuggestion(null);
    if (name.length < 3) return;
    setLoading(true);
    const t = setTimeout(async () => {
      const mods = await base44.entities.Moderation.filter({ roblox_username: name }, '-moderation_date', 100);
      setSuggestion(suggestEscalation(mods || []));
      setLoading(false);
    }, 500);
    return () => { clearTimeout(t); setLoading(false); };
  }, [username]);

  if (loading) return <div className="flex items-center gap-1.5 text-xs text-slate-500"><Loader2 className="h-3 w-3 animate-spin" /> Checking history…</div>;
  if (!suggestion) return null;

  const label = `${suggestion.moderation_type}${suggestion.duration ? ` · ${suggestion.duration}` : ''}`;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-violet-500/[0.07] border border-violet-500/20 px-3 py-2 text-xs">
      <TrendingUp className="h-3.5 w-3.5 text-violet-300" />
      <span className="text-slate-300">
        {suggestion.offenses === 0 ? 'First offense' : `${suggestion.offenses} prior offense${suggestion.offenses > 1 ? 's' : ''}`} — suggested: <b className="text-violet-200">{label}</b>
      </span>
      <button type="button" onClick={() => onApply(suggestion)} className="ml-auto px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-200 hover:bg-violet-500/25">
        Apply
      </button>
    </div>
  );
}