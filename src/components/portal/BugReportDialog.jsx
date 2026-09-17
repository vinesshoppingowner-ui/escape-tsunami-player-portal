import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Bug } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CustomDropdown from '@/components/ui/custom-dropdown';

const SEVERITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

export default function BugReportDialog({ open, onClose, robloxUsername }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setSeverity('Low');
      setSaving(false);
    }
  }, [open]);

  const submit = async () => {
    if (!title.trim() || !description.trim() || saving) return;
    setSaving(true);
    try {
      await base44.entities.BugReport.create({
        roblox_username: robloxUsername || 'Guest',
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'Submitted',
      });
      toast({ title: 'Bug report submitted', description: 'Thank you! Our team will look into it.' });
      onClose();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to submit', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-white/15 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-lg flex items-center gap-2">
            <Bug className="h-5 w-5 text-amber-400" /> Report a Bug
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Found a bug in Escape Tsunami? Let us know \u2014 be as detailed as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-slate-400">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of the bug" className="bg-slate-900/60 border-white/15 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Severity</Label>
            <CustomDropdown value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Description *</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Steps to reproduce, what you expected, and what actually happened\u2026" className="bg-slate-900/60 border-white/15 text-white mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={submit} disabled={saving || !title.trim() || !description.trim()} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0">
              {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Submitting</> : <><Bug className="h-4 w-4 mr-1.5" /> Submit report</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}