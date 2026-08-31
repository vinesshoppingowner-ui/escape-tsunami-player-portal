import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, User, LogOut, Inbox, RefreshCw, Waves } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import ModerationCard from '@/components/moderations/ModerationCard';
import AppealDialog from '@/components/moderations/AppealDialog';

export default function Portal() {
  const { user, isAuthenticated, logout } = useAuth();
  const [robloxUsername, setRobloxUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState('');
  const [saving, setSaving] = useState(false);

  const [moderations, setModerations] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeModeration, setActiveModeration] = useState(null);

  // pull username from profile once user loads
  useEffect(() => {
    if (user?.roblox_username) {
      setSavedUsername(user.roblox_username);
      setRobloxUsername(user.roblox_username);
    }
  }, [user]);

  const loadData = async (username) => {
    setLoading(true);
    try {
      const [mods, apps] = await Promise.all([
        base44.entities.Moderation.filter({ roblox_username: username }, '-moderation_date', 50),
        base44.entities.Appeal.filter({ roblox_username: username }, '-created_date', 50),
      ]);
      setModerations(mods || []);
      setAppeals(apps || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (savedUsername) loadData(savedUsername);
    else setLoading(false);
  }, [savedUsername]);

  const saveUsername = async () => {
    if (!robloxUsername.trim()) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ roblox_username: robloxUsername.trim() });
      setSavedUsername(robloxUsername.trim());
    } finally {
      setSaving(false);
    }
  };

  const appealFor = (moderationId) => appeals.find((a) => a.moderation_id === moderationId);

  const openAppeal = (moderation) => {
    setActiveModeration(moderation);
    setDialogOpen(true);
  };

  const submitAppeal = async (reason) => {
    await base44.entities.Appeal.create({
      moderation_id: activeModeration.id,
      roblox_username: savedUsername,
      appeal_reason: reason,
      status: 'Pending',
    });
    await loadData(savedUsername);
  };

  const refresh = () => savedUsername && loadData(savedUsername);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Member Portal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="mt-2 text-slate-400">Review your recent in-game moderations and submit appeals.</p>
        </motion.div>

        {/* Username setup */}
        {!savedUsername ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Link your Roblox account</h2>
                <p className="mt-1 text-sm text-slate-400">Enter your exact Roblox username so we can pull up your moderations.</p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label htmlFor="rbx-user" className="sr-only">Roblox username</Label>
                    <Input
                      id="rbx-user"
                      value={robloxUsername}
                      onChange={(e) => setRobloxUsername(e.target.value)}
                      placeholder="Your Roblox username"
                      className="bg-slate-950/50 border-white/15 text-white placeholder:text-slate-500 h-11"
                      onKeyDown={(e) => e.key === 'Enter' && saveUsername()}
                    />
                  </div>
                  <Button
                    onClick={saveUsername}
                    disabled={!robloxUsername.trim() || saving}
                    className="h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Link account
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Status bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-slate-300">Playing as</span>
                  <span className="font-semibold text-white">{savedUsername}</span>
                </span>
                <span className="text-slate-500 text-xs">
                  {moderations.length} moderation{moderations.length !== 1 ? 's' : ''} · {appeals.length} appeal{appeals.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={refresh} className="text-slate-300 hover:text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                </Button>
                <Button size="sm" variant="ghost" onClick={() => logout()} className="text-slate-300 hover:text-white hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-1.5" /> Sign out
                </Button>
              </div>
            </div>

            {/* Moderations */}
            <div className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading your moderations…
                </div>
              ) : moderations.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-20 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Clean record</h3>
                  <p className="mt-1.5 text-sm text-slate-400 max-w-sm mx-auto">
                    No moderations found for <span className="text-cyan-300">{savedUsername}</span>. Keep surviving those tsunamis! 🌊
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moderations.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <ModerationCard
                        moderation={m}
                        appeal={appealFor(m.id)}
                        onAppeal={() => openAppeal(m)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AppealDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        moderation={activeModeration}
        robloxUsername={savedUsername}
        onSubmit={submitAppeal}
      />
    </div>
  );
}