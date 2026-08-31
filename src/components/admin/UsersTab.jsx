import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logStaffAction } from '@/lib/staffLog';
import { Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function UsersTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setUsers((await base44.entities.User.list(100)) || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setRole = async (u, role) => {
    setSavingId(u.id);
    try {
      await base44.entities.User.update(u.id, { role });
      await logStaffAction(user, 'user_role_changed', u.email, `Set ${u.email} to ${role}`);
      await load();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div>
      <p className="text-sm text-slate-400 mb-3">Grant admin access so teammates can use this dashboard.</p>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{u.email}</div>
              <div className="text-xs text-slate-500">{u.full_name || '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              {u.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  <UserIcon className="h-3.5 w-3.5" /> Member
                </span>
              )}
              <select
                value={u.role || 'user'}
                disabled={savingId === u.id}
                onChange={(e) => setRole(u, e.target.value)}
                className="h-9 rounded-md border border-white/15 bg-slate-950/60 px-2 text-sm text-white"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}