import AppealChat from '@/components/appeals/AppealChat';
import { Link } from 'react-router-dom';
import AppealAssign from '@/components/admin/appeals/AppealAssign';
import AppealTimeline from '@/components/admin/appeals/AppealTimeline';
import PlayerHistoryPanel from '@/components/admin/appeals/PlayerHistoryPanel';
import PlayerNotesPanel from '@/components/admin/watchlist/PlayerNotesPanel';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/lib/AuthContext';
import { applyAppealDecision } from '@/lib/appealDecision';
import { isOwner } from '@/lib/isOwner';
import { can } from '@/lib/staffPermissions';
import ReviewQuickDecision from '@/components/admin/appeals/ReviewQuickDecision';
import ReviewModerationAdjust from '@/components/admin/appeals/ReviewModerationAdjust';
import ReviewAppealManage from '@/components/admin/appeals/ReviewAppealManage';
import ReviewDecisionForm from '@/components/admin/appeals/ReviewDecisionForm';
import ReviewAppealAnswers from '@/components/admin/appeals/ReviewAppealAnswers';
import ReviewModerationSummary from '@/components/admin/appeals/ReviewModerationSummary';
import ReviewLogsPanel from '@/components/admin/appeals/ReviewLogsPanel';
import { Button } from '@/components/ui/button';
import { Loader2, Gavel, Lock, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { fetchChatLogs, fetchExploitLogs } from '@/lib/renderBridge';
import AppealAISummary from '@/components/admin/AppealAISummary';

const STATUS_STYLES = {
  'Pending': { cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Clock },
  'Under Review': { cls: 'bg-violet-500/10 text-violet-300 border-violet-500/20', icon: Loader2 },
  'Approved': { cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: CheckCircle2 },
  'Denied': { cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: XCircle },
};

const tabCls = 'rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm text-slate-400 data-[state=active]:border-indigo-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none';

export default function AppealReviewModal({ open, onClose, appeal, moderation, onSaved, playerLocked }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [chatLogs, setChatLogs] = useState([]);
  const [exploitLogs, setExploitLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  useEffect(() => {
    if (appeal) {
      setDraft({
        status: appeal.status,
        staff_response: appeal.staff_response || '',
        internal_notes: appeal.internal_notes || '',
        can_reappeal: appeal.can_reappeal !== false,
        reappeal_after: appeal.reappeal_after || '',
        reappeal_guidance: appeal.reappeal_guidance || '',
      });
    }
  }, [appeal?.id]);

  useEffect(() => {
    if (!open || !appeal?.roblox_username) return;
    setLogsLoading(true);
    setLogsError('');
    Promise.all([
      fetchChatLogs(appeal.roblox_username).catch(() => []),
      fetchExploitLogs(appeal.roblox_username).catch(() => []),
    ])
      .then(([chats, exploits]) => { setChatLogs(chats); setExploitLogs(exploits); })
      .catch(() => setLogsError('Failed to load logs'))
      .finally(() => setLogsLoading(false));
  }, [open, appeal]);

  if (!appeal || !draft) return null;

  const isAdmin = isOwner(user);
  const canDecide = can(user, 'decide_appeals');
  const st = STATUS_STYLES[appeal.status] || STATUS_STYLES['Pending'];
  const StatusIcon = st.icon;

  const decide = async (status) => {
    await applyAppealDecision({ appeal, moderation, user, ...draft, status });
    onSaved?.();
    onClose();
  };

  const save = async () => {
    setSaving(true);
    try {
      await applyAppealDecision({ appeal, moderation, user, ...draft });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-3xl p-0 flex flex-col gap-0 h-[85vh] overflow-hidden">
        <div className="px-6 pt-5 pr-12">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/admin/player/${encodeURIComponent(appeal.roblox_username)}`} className="text-indigo-300 font-medium hover:underline">{appeal.roblox_username}</Link>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border ${st.cls}`}>
              <StatusIcon className="h-3 w-3" /> {appeal.status}
            </span>
          </div>
          <DialogTitle className="text-lg font-semibold mt-1">{moderation?.moderation_type || 'Moderation'} Appeal</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-0.5">Submitted {new Date(appeal.created_date).toLocaleString()}</DialogDescription>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-3 h-auto p-0 bg-transparent justify-start gap-1 border-b border-slate-800 rounded-none overflow-x-auto">
            <TabsTrigger value="overview" className={tabCls}>Overview & Decision</TabsTrigger>
            <TabsTrigger value="history" className={tabCls}>Player History & Logs</TabsTrigger>
            <TabsTrigger value="chat" className={tabCls}>Live Chat</TabsTrigger>
            <TabsTrigger value="ai" className={tabCls}>AI Summary</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {playerLocked && (
                <div className="rounded-md border border-violet-500/30 bg-violet-500/10 p-3 text-sm text-violet-200 flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" /> This player is locked from submitting any appeals.
                </div>
              )}
              {canDecide ? (
                <ReviewQuickDecision current={appeal.status} onDecide={decide} />
              ) : (
                <p className="text-xs text-slate-400">An admin has turned off your permission to approve or deny appeals. You can still move it to Under Review, chat, and add notes.</p>
              )}
              {isAdmin && <AppealAssign appeal={appeal} user={user} onChanged={() => onSaved?.()} />}
              <ReviewModerationSummary moderation={moderation} appeal={appeal} />
              {moderation && !moderation.unlisted && can(user, 'edit_moderations') && <ReviewModerationAdjust moderation={moderation} user={user} onChanged={() => onSaved?.()} />}
              <ReviewAppealAnswers appeal={appeal} />
              <ReviewDecisionForm appeal={appeal} moderation={moderation} user={user} draft={draft} setDraft={setDraft} canDecide={canDecide} />
              <ReviewAppealManage
                appeal={appeal}
                canReappeal={draft.can_reappeal}
                onReappealChange={(v) => setDraft({ ...draft, can_reappeal: v })}
                onDeleted={() => { onSaved?.(); onClose(); }}
                isAdmin={isAdmin}
                user={user}
                playerLocked={playerLocked}
                onChanged={() => onSaved?.()}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-6">
              {isAdmin && <PlayerHistoryPanel username={appeal.roblox_username} currentAppealId={appeal.id} />}
              {isAdmin && <AppealTimeline appeal={appeal} />}
              {isAdmin && <PlayerNotesPanel username={appeal.roblox_username} />}
              <ReviewLogsPanel chatLogs={chatLogs} exploitLogs={exploitLogs} loading={logsLoading} error={logsError} />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <AppealChat appeal={appeal} />
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              {logsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading logs…</div>
              ) : chatLogs.length > 0 || exploitLogs.length > 0 ? (
                <AppealAISummary chatLogs={chatLogs} exploitLogs={exploitLogs} moderation={moderation} appeal={appeal} />
              ) : (
                <p className="text-sm text-slate-500">No chat or exploit logs on file, so there's nothing for the AI to summarize.</p>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 px-6 py-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving</> : <><Gavel className="h-4 w-4 mr-1.5" /> Save decision</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}