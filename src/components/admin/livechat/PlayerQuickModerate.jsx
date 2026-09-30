import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { emailModerationIssued } from '@/lib/moderationEmails';
import { useAuth } from '@/lib/AuthContext';
import { logStaffAction } from '@/lib/staffLog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Gavel, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { pushBan } from '@/lib/renderBridge';
import { isBanType } from '@/lib/staffUndo';
import { canIssueType } from '@/lib/staffPermissions';

const TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const DURATIONS = ['', '1h', '24h', '7d', '30d'];

export default function PlayerQuickModerate({ username, evidence, onDone }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState('Warning');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const needsDuration = type === 'Temporary Ban' || type === 'Mute';

  const submit = async () => {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      const data = {
        roblox_username: username,
        moderation_type: type,
        reason: reason.trim(),
        details: evidence ? `Issued from Live Chat.\n\nChat evidence:\n${evidence}` : 'Issued from Live Chat.',
        duration: needsDuration ? duration : '',
        status: 'Active',
        staff_member: user?.full_name || user?.email || 'Staff',
        moderation_date: new Date().toISOString(),
        evidence_type: evidence ? 'chat_log' : 'none',
        evidence_text: evidence || '',
      };
      const created = await base44.entities.Moderation.create(data);
      emailModerationIssued(data);
      base44.entities.Notification.create({
        roblox_username: username,
        title: `New ${type} issued`,
        body: reason.trim(),
        type: 'moderation_issued',
        read: false,
      });
      logStaffAction(user, 'moderation_issued', username, `Issued ${type} from Live Chat — ${reason.trim()}`,
        [{ op: 'delete', entity: 'Moderation', id: created.id }, ...(isBanType(type) ? [{ op: 'unban', username }] : [])]);

      if (type === 'Permanent Ban' || type === 'Temporary Ban') {
        try {
          await pushBan(data);
        } catch (e) {
          toast({ variant: 'destructive', title: 'Ban saved, but game push failed', description: e.message });
        }
      }
      toast({ title: `${type} issued`, description: `${username} has been moderated.` });
      setReason('');
      onDone?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3.5 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TYPES.filter((t) => canIssueType(user, t)).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              type === t
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required)"
        className="bg-slate-950/60 border-white/10 text-white h-9 rounded-lg"
      />
      {needsDuration && (
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d || 'perm'}
              onClick={() => setDuration(d)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                duration === d
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {d || 'Permanent'}
            </button>
          ))}
        </div>
      )}
      {evidence && (
        <p className="text-[11px] text-slate-500">This message will be attached as chat-log evidence.</p>
      )}
      <Button
        onClick={submit}
        disabled={saving || !reason.trim()}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
      >
        {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Issuing</> : <><Gavel className="h-4 w-4 mr-1.5" /> Issue {type}</>}
      </Button>
    </div>
  );
}