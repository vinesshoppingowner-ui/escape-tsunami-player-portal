import { useEffect, useState } from 'react';
import { Gavel } from 'lucide-react';
import ModerationForm from '@/components/admin/moderations/ModerationForm';

// Floating "Moderate player" button available on every console tab. Shortcut: Shift + M.
export default function QuickPunishButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
      if (!typing && e.shiftKey && e.key.toLowerCase() === 'm') { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Moderate a player (Shift + M)"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium shadow-lg shadow-black/40 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <Gavel className="h-4 w-4 text-slate-400" /> Moderate player
        <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">⇧M</kbd>
      </button>
      <ModerationForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}