import SiteNav from '@/components/SiteNav';
import KnowledgeBaseTab from '@/components/admin/KnowledgeBaseTab';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/isOwner';
import { ShieldAlert } from 'lucide-react';

export default function KnowledgeBase() {
  const { user } = useAuth();
  const access = isOwner(user) || user?.role === 'staff';

  if (!access) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <main className="max-w-3xl mx-auto px-5 pt-28 pb-20 text-center">
          <div className="h-14 w-14 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Staff only</h1>
          <p className="mt-2 text-slate-400">You need a staff or admin account to view the knowledge base.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-slate-950">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-slate-300 mb-4">
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" /> Internal Staff Resource
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="mt-2 text-slate-400">
          Searchable staff handbook — moderation guidance, escalation procedures, appeals process, and more.
        </p>
        <KnowledgeBaseTab />
      </main>
    </div>
  );
}