import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { parseRoleChanges } from '@/components/admin/discord/roleImportAI';

export default function TextRoleImport({ roleNames, onApply }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const n = onApply(await parseRoleChanges(roleNames, { text }));
    toast({ title: `Staged changes for ${n} role(s) — review, then Save all` });
    setLoading(false);
    setOpen(false);
    setText('');
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="w-full mb-2 border-slate-700 bg-transparent text-slate-300"><FileText className="h-4 w-4" /> Import from text</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-950 border-white/10 text-white">
          <DialogHeader><DialogTitle>Import role changes from text</DialogTitle></DialogHeader>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder={'Member -> Survivor, #3BA55C\nMod -> Moderator, red, perms: Kick Members, Timeout Members'} className="bg-slate-900 border-white/15 text-white" />
          <Button onClick={run} disabled={!text.trim() || loading} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} {loading ? 'Reading…' : 'Stage changes'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}