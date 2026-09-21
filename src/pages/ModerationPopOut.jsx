import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import ModerationsTab from '@/components/admin/ModerationsTab';
import { ShieldAlert } from 'lucide-react';

export default function ModerationPopOut() {
  const { user } = useAuth();

  if (!isOwner(user) && user?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Staff only</h1>
          <p className="mt-2 text-slate-400">You need a staff or admin account to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Moderation console</h1>
          <p className="mt-1 text-sm text-slate-400">Standalone moderation management view.</p>
        </div>
        <ModerationsTab />
      </main>
    </div>
  );
}