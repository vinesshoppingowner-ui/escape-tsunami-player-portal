import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, Check, X, ExternalLink, RefreshCw, Inbox } from 'lucide-react';
import SiteNav from '@/components/SiteNav';

export default function Admin() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.VerificationRequest.list('-created_date', 100);
      setRequests(all || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SiteNav />
        <div className="max-w-3xl mx-auto px-5 pt-32 pb-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-rose-400" />
          </div>
          <h1 className="text-2xl font-semibold">Staff only</h1>
          <p className="text-slate-400 mt-2">You need an admin account to review verification requests.</p>
        </div>
      </div>
    );
  }

  const approve = async (r) => {
    setActing(r.id);
    try {
      await base44.entities.User.update(r.created_by_id, { roblox_username: r.roblox_username });
      await base44.entities.VerificationRequest.update(r.id, { status: 'approved' });
      await load();
    } catch (e) {
      alert('Could not approve: ' + (e?.message || 'unknown error'));
    } finally {
      setActing(null);
    }
  };

  const deny = async (r) => {
    setActing(r.id);
    try {
      await base44.entities.VerificationRequest.update(r.id, { status: 'denied' });
      await load();
    } finally {
      setActing(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const recent = requests.filter((r) => r.status !== 'pending').slice(0, 10);

  const statusBadge = {
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    denied: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Staff Console
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Verification requests</h1>
            <p className="mt-2 text-slate-400">Confirm the code is in the player's Roblox bio, then approve to link their account.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={load} className="text-slate-300 hover:text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading requests…
          </div>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                Pending · {pending.length}
              </h2>
              {pending.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-14 text-center">
                  <Inbox className="h-8 w-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No pending requests. You are all caught up.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }}
                      className="rounded-2xl bg-white/[0.03] border border-white/10 p-5"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{r.roblox_username}</span>
                            <Badge variant="outline" className="text-xs border bg-amber-500/15 text-amber-300 border-amber-500/30">Pending</Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                            <span>Code in bio:</span>
                            <code className="font-mono text-cyan-300 font-semibold bg-slate-950/60 px-2 py-0.5 rounded border border-white/10 select-all">{r.code}</code>
                          </div>
                        </div>
                        <a href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(r.roblox_username)}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                            <ExternalLink className="h-4 w-4 mr-1.5" /> Check bio
                          </Button>
                        </a>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approve(r)}
                          disabled={acting === r.id}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0"
                        >
                          {acting === r.id ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deny(r)}
                          disabled={acting === r.id}
                          className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                        >
                          <X className="h-4 w-4 mr-1.5" /> Deny
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {recent.length > 0 && (
              <section className="mt-10">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Recent decisions</h2>
                <div className="space-y-2">
                  {recent.map((r) => (
                    <div key={r.id} className="rounded-xl bg-white/[0.02] border border-white/10 px-4 py-3 flex items-center justify-between gap-3">
                      <span className="font-medium text-white text-sm">{r.roblox_username}</span>
                      <Badge variant="outline" className={`text-xs border ${statusBadge[r.status]}`}>{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}