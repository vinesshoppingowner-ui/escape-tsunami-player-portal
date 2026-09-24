import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ScrollText } from 'lucide-react';
import StaffLogUndoButton from '@/components/admin/stafflogs/StaffLogUndoButton';

const ACTION_STYLE = {
  appeal_decision: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  moderation_issued: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  moderation_deleted: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  user_role_changed: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  permissions_changed: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  action_undone: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
};

export default function StaffLogsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLogs((await base44.entities.StaffLog.list('-created_date', 100)) || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onUndone = (ok, message) => {
    toast(ok ? { title: 'Action undone' } : { variant: 'destructive', title: 'Could not undo', description: message });
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!logs.length) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-400">
        <ScrollText className="h-7 w-7 mx-auto mb-2 text-slate-600" />
        Nothing here yet — staff actions will show up here as they happen.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((l) => (
        <div key={l.id} className={`flex items-start justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 ${l.undone ? 'opacity-60' : ''}`}>
          <div className="min-w-0">
            <div className={`text-sm text-white ${l.undone ? 'line-through' : ''}`}>{l.detail}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span className="text-cyan-300">{l.staff_username}</span>
              {l.target ? ` · ${l.target}` : ''}
              {' · '}{new Date(l.created_date).toLocaleString()}
              {l.undone && <span className="text-violet-300"> · Undone by {l.undone_by}</span>}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {l.undo_ops && !l.undone && <StaffLogUndoButton log={l} user={user} onDone={onUndone} />}
            <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full border ${ACTION_STYLE[l.action] || ''}`}>
              {l.action.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}