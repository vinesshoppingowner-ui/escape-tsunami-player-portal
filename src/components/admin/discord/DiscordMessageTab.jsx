import { useEffect, useState, useRef } from 'react';
import FormatToolbar from '@/components/admin/discord/FormatToolbar';
import AskGeminiDialog from '@/components/admin/discord/AskGeminiDialog';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import EmbedPreview from '@/components/admin/discord/EmbedPreview';
import BulkSendPanel from '@/components/admin/discord/BulkSendPanel';
import DiscordRolesPanel from '@/components/admin/discord/DiscordRolesPanel';

const field = 'bg-slate-950/60 border-white/15 text-white';

export default function DiscordMessageTab() {
  const { toast } = useToast();
  const [channels, setChannels] = useState(null);
  const [channel, setChannel] = useState('');
  const [content, setContent] = useState('');
  const [useEmbed, setUseEmbed] = useState(false);
  const [e, setE] = useState({ title: '', description: '', colorHex: '#2563EB', image: '', footer: '' });
  const [sending, setSending] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [mode, setMode] = useState('single');
  const textRef = useRef(null);
  const applyAI = (r) => {
    setContent(r.content || '');
    if (useEmbed) setE({ ...e, title: r.title || '', description: r.description || '', footer: r.footer || '', colorHex: /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : e.colorHex });
  };

  useEffect(() => {
    base44.functions.invoke('discordSend', { action: 'channels' })
      .then((r) => setChannels(r.data.channels))
      .catch((err) => { setChannels([]); toast({ title: err.response?.data?.error || 'Could not load channels', variant: 'destructive' }); });
  }, []);

  const embed = useEmbed ? e : null;
  const send = async () => {
    setSending(true);
    try {
      await base44.functions.invoke('discordSend', {
        action: 'send', channel_id: channel, content,
        embed: embed && {
          title: e.title || undefined, description: e.description || undefined,
          color: parseInt(e.colorHex.replace('#', ''), 16),
          image: e.image ? { url: e.image } : undefined, footer: e.footer ? { text: e.footer } : undefined,
        },
      });
      toast({ title: 'Message sent' });
      setContent(''); setE({ ...e, title: '', description: '', image: '', footer: '' });
    } catch (err) {
      toast({ title: err.response?.data?.error || 'Send failed', variant: 'destructive' });
    }
    setSending(false);
  };

  const set = (k) => (ev) => setE({ ...e, [k]: ev.target.value });
  const empty = !content.trim() && !(useEmbed && (e.title || e.description || e.image));

  const modeBtn = (m, label) => (
    <button onClick={() => setMode(m)} className={`flex-1 px-3 py-1.5 rounded-md text-sm ${mode === m ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>
  );
  const switcher = <div className="flex gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 mb-4 max-w-xs">{modeBtn('single', 'Single')}{modeBtn('bulk', 'Bulk (5 channels)')}{modeBtn('roles', 'Roles')}</div>;
  if (mode === 'bulk') return <div>{switcher}<BulkSendPanel channels={channels} /></div>;
  if (mode === 'roles') return <div>{switcher}<DiscordRolesPanel /></div>;

  return (
    <div>{switcher}
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="space-y-3 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <select value={channel} onChange={(ev) => setChannel(ev.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${field}`}>
          <option value="">{channels ? 'Select a channel…' : 'Loading channels…'}</option>
          {(channels || []).map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
        </select>
        <Button type="button" variant="outline" onClick={() => setAskOpen(true)} className="w-full border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 hover:text-white">
          <Sparkles className="h-4 w-4" /> Ask Gemini
        </Button>
        <FormatToolbar textareaRef={textRef} value={content} onChange={setContent} />
        <Textarea ref={textRef} value={content} onChange={(ev) => setContent(ev.target.value)} placeholder="Message text (optional with embed)" rows={4} className={field} />
        <label className="flex items-center gap-2 text-sm text-slate-300"><Switch checked={useEmbed} onCheckedChange={setUseEmbed} /> Include embed</label>
        {useEmbed && (
          <div className="space-y-2">
            <Input value={e.title} onChange={set('title')} placeholder="Embed title" className={field} />
            <Textarea value={e.description} onChange={set('description')} placeholder="Embed description" rows={4} className={field} />
            <div className="flex gap-2">
              <input type="color" value={e.colorHex} onChange={set('colorHex')} className="h-10 w-12 rounded bg-transparent" />
              <Input value={e.image} onChange={set('image')} placeholder="Image URL (optional)" className={field} />
            </div>
            <Input value={e.footer} onChange={set('footer')} placeholder="Footer (optional)" className={field} />
          </div>
        )}
        <Button onClick={send} disabled={sending || !channel || empty} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send to Discord
        </Button>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Preview</div>
        <EmbedPreview content={content} embed={embed} />
      </div>
      <AskGeminiDialog open={askOpen} onOpenChange={setAskOpen} useEmbed={useEmbed} onResult={applyAI} />
    </div>
    </div>
  );
}