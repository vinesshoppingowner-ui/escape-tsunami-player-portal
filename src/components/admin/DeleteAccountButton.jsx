import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { isOwner } from '@/lib/isOwner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Admin-only: fully removes a player's portal account so they can register again.
export default function DeleteAccountButton({ account, currentUser }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  if (!isOwner(currentUser) || account.id === currentUser?.id) return null;
  if (deleted) return <p className="text-sm text-rose-300 mt-2">Portal account deleted.</p>;

  const remove = async () => {
    setBusy(true);
    try {
      await base44.entities.User.delete(account.id);
      setDeleted(true);
      toast({ title: 'Account deleted', description: `${account.email} can now create a new account.` });
    } catch (e) {
      toast({ title: 'Failed to delete account', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={busy} variant="outline" className="mt-2 border-rose-500/40 bg-transparent text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this portal account?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {account.email} will be removed from the portal completely. Their moderation history stays on record, and they can sign up again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-white/5">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={remove} className="bg-rose-600 hover:bg-rose-500 text-white">Delete account</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}