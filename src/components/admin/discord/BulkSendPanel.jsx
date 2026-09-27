import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const field = 'bg-slate-950/60 border-white/15 text-white';
const blank = () => Array.from({ length: 5 }, () => ({ channel: '', content: '' }));

export default function BulkSendPanel({ channels }) {
  const { toast } = useToast();
  const [slots, setSlots] = useState(blank);
  const [sending, setSending] = useState(false);
  const update = (i, k, v) => setSlots(slots.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const ready = slots.filter((s) => s.channel && s.content.trim());

  const sendAll = async () => {
    setSending(true);
    const results = await Promise.allSettled(ready.map((s) =>
      base44.functions.invoke('discordSend', { action: 'send', channel_id: s.channel, content: s.content })));
    const failed = results.filter((r) => r.status === 'rejected').length;
    toast({ title: `Sent ${ready.length - failed} of ${ready.length} messages`, variant: failed ? 'destructive' : undefined });
    if (!failed) setSlots(blank());
    setSending(false);
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      {slots.map((s, i) => (
        <div key={i} className="space-y-2 pb-3 border-b border-white/5 last:border-0">
          <select value={s.channel} onChange={(e) => update(i, 'channel', e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${field}`}>
            <option value="">{channels ? `Channel ${i + 1} — select…` : 'Loading channels…'}</option>
            {(channels || []).map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select>
          <Textarea value={s.content} onChange={(e) => update(i, 'content', e.target.value)} placeholder={`Message for channel ${i + 1}`} rows={2} className={field} />
        </div>
      ))}
      <Button onClick={sendAll} disabled={sending || !ready.length} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send all ({ready.length})
      </Button>
    </div>
  );
}