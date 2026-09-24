import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, Megaphone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { AUDIENCES, resolveAudience } from '@/lib/messageAudience';
import { emailPlayer } from '@/lib/userEmails';

export default function MassMessageTab() {
  const { toast } = useToast();
  const [form, setForm] = useState({ audience: 'single', username: '', title: '', body: '', email: true });
  const [sending, setSending] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim() && form.body.trim() && (form.audience !== 'single' || form.username.trim());

  const send = async () => {
    setSending(true);
    const names = await resolveAudience(form.audience, form.username);
    if (!names.length || !window.confirm(`Send this message to ${names.length} player(s)?`)) { setSending(false); return; }
    await base44.entities.Notification.bulkCreate(names.map((n) => ({ roblox_username: n, title: form.title, body: form.body, type: 'staff_message', read: false })));
    let emailed = 0;
    if (form.email) {
      for (const n of names) {
        if (await emailPlayer({ robloxUsername: n, subject: form.title, title: `📣 ${form.title}`, body: `Hi ${n},\n\n${form.body}\n\n— Escape Tsunami Staff Team`, accent: '#06b6d4' })) emailed++;
      }
    }
    setSending(false);
    setForm((f) => ({ ...f, title: '', body: '' }));
    toast({ title: `Message sent to ${names.length} player(s)`, description: form.email ? `${emailed} email(s) delivered` : undefined });
  };

  const input = 'w-full bg-slate-950/60 border border-white/15 rounded-lg px-3 h-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50';
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2.5">
        <Megaphone className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Message players</h2>
      </div>
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Send to</label>
            <CustomDropdown value={form.audience} onChange={set('audience')} options={AUDIENCES} />
          </div>
          {form.audience === 'single' && (
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Roblox username</label>
              <input value={form.username} onChange={(e) => set('username')(e.target.value)} className={input} />
            </div>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Title</label>
          <input value={form.title} onChange={(e) => set('title')(e.target.value)} maxLength={120} placeholder="e.g. Server maintenance tonight" className={input} />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Message</label>
          <Textarea rows={5} value={form.body} onChange={(e) => set('body')(e.target.value)} className="bg-slate-950/60 border-white/15 text-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={form.email} onChange={(e) => set('email')(e.target.checked)} className="h-4 w-4 accent-cyan-500" />
          Also send as email (players with a portal account)
        </label>
        <div className="flex justify-end">
          <button onClick={send} disabled={!valid || sending} className="h-9 px-4 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm inline-flex items-center gap-1.5 disabled:opacity-40">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500">Players see the message in their portal notifications.</p>
    </div>
  );
}