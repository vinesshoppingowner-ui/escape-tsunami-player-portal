import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const call = (action, channel_id, content) => base44.functions.invoke('discordSend', { action, channel_id, content });

export default function BulkRoleMember({ roleIds }) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!query.trim()) return setResults([]);
    const t = setTimeout(() => call('searchMembers', null, query.trim()).then((r) => setResults(r.data.members)).catch((e) => { setResults([]); toast({ title: e.response?.data?.error || 'Member search failed', variant: 'destructive' }); }), 200);
    return () => clearTimeout(t);
  }, [query]);

  const add = async (m) => {
    setBusy(true);
    const res = await Promise.allSettled(roleIds.map((id) => call('addRoleMember', id, m.id)));
    const failed = res.filter((r) => r.status === 'rejected');
    toast({ title: `Added ${m.name} to ${roleIds.length - failed.length} of ${roleIds.length} roles`, description: failed[0]?.reason?.response?.data?.error, variant: failed.length ? 'destructive' : undefined });
    setQuery(''); setBusy(false);
  };

  return (
    <div className="relative mb-2">
      <div className="flex items-center gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <UserPlus className="h-4 w-4 text-emerald-400" />}
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Add member to ${roleIds.length} selected…`} className="h-8 bg-slate-950/60 border-white/15 text-white text-xs" />
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-white/10 bg-slate-900 shadow-lg">
          {results.map((m) => (
            <button key={m.id} disabled={busy} onClick={() => add(m)} className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">
              {m.name} <span className="text-slate-500">@{m.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}