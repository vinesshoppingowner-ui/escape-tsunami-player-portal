import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

export default function AskGeminiDialog({ open, onOpenChange, useEmbed, onResult }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      prompt: `Write a Discord message for the Escape Tsunami Roblox game community. Request: ${prompt}
Use Discord markdown (**bold**, *italic*, -# small text, > quotes, emojis) where it fits. ${useEmbed ? 'Fill an embed title, description and footer; content can be empty or a short ping line.' : 'Only fill content; leave embed fields empty.'} color is a hex like #2563EB.`,
      response_json_schema: { type: 'object', properties: {
        content: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, footer: { type: 'string' }, color: { type: 'string' },
      } },
    });
    setLoading(false);
    onResult(res);
    onOpenChange(false);
    setPrompt('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-white/10 text-white">
        <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-400" /> Ask Gemini</DialogTitle>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="e.g. Announce a double coins weekend starting Friday"
          className="bg-slate-900/60 border-white/15 text-white" />
        <Button onClick={generate} disabled={loading || !prompt.trim()} className="bg-violet-600 hover:bg-violet-500 text-white">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
        </Button>
      </DialogContent>
    </Dialog>
  );
}