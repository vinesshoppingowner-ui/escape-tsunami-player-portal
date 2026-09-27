import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const call = (action, channel_id, content) => base44.functions.invoke('discordSend', { action, channel_id, content });

export default function RoleMembers({ roleId }) {
  const { toast } = useToast();
  const [members, setMembers] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const fail = (e) => toast({ title: e.response?.data?.error || 'Something went wrong', variant: 'destructive' });

  const load = () => call('roleMembers', roleId).then((r) => setMembers(r.data.members)).catch((e) => { setMembers([]); fail(e); });
  useEffect(() => { setMembers(null); load(); }, [roleId]);
  useEffect(() => {
    if (!query.trim()) return setResults([]);
    const t = setTimeout(() => call('searchMembers', null, query.trim()).then((r) => setResults(r.data.members)).catch(fail), 200);
    return () => clearTimeout(t);
  }, [query]);

  const change = (action, id) => call(action, roleId, id).then(() => { setQuery(''); load(); }).catch(fail);

  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Members {members && `(${members.length})`}</div>
      <div className="relative mb-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a member to add…" className="bg-slate-950/60 border-white/15 text-white" />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-white/10 bg-slate-900 shadow-lg">
            {results.map((m) => (
              <button key={m.id} onClick={() => change('addRoleMember', m.id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                <Plus className="h-3.5 w-3.5 text-emerald-400" /> {m.name} <span className="text-slate-500">@{m.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {!members ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : (
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {members.length === 0 && <span className="text-sm text-slate-500">No members have this role.</span>}
          {members.map((m) => (
            <span key={m.id} className="flex items-center gap-1 rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200">
              {m.name}
              <button onClick={() => change('removeRoleMember', m.id)} className="text-slate-500 hover:text-rose-400"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}