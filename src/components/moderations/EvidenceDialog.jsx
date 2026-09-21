import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import { ScrollText, ImageIcon, Inbox, Calendar, UserCog } from 'lucide-react';
import { format } from 'date-fns';

export default function EvidenceDialog({ open, onClose, moderation }) {
  const type = moderation?.evidence_type;
  const hasChat = type === 'chat_log' && moderation?.evidence_text;
  const hasShot = type === 'screenshot' && moderation?.evidence_image_url;
  const hasAny = hasChat || hasShot;

  const meta = [
    moderation?.moderation_date && {
      icon: Calendar,
      label: format(new Date(moderation.moderation_date), 'MMM d, yyyy · h:mm a'),
    },
    moderation?.staff_member && { icon: UserCog, label: moderation.staff_member },
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-white/15 text-white sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
          <div className="flex items-start gap-3.5 pr-8">
            <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              {hasChat ? <ScrollText className="h-5 w-5 text-cyan-300" /> : <ImageIcon className="h-5 w-5 text-cyan-300" />}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold leading-tight">
                Evidence · {moderation?.moderation_type}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1 leading-relaxed">
                {moderation?.reason || 'Review the material attached to this moderation.'}
              </DialogDescription>
            </div>
          </div>
          {meta.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
              {meta.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <m.icon className="h-3.5 w-3.5 text-slate-500" /> {m.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto">
          {hasChat && (
            <div className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                <ScrollText className="h-3.5 w-3.5 text-cyan-400" /> In-game chat log
              </div>
              <pre className="text-xs font-mono text-slate-300 p-4 whitespace-pre-wrap max-h-[45vh] overflow-auto leading-relaxed">
                {moderation.evidence_text}
              </pre>
            </div>
          )}

          {hasShot && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900/40">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                <ImageIcon className="h-3.5 w-3.5 text-cyan-400" /> Screenshot
              </div>
              <Image
                src={moderation.evidence_image_url}
                alt="Evidence screenshot"
                className="w-full max-h-[55vh]"
                fittingType="fit"
              />
            </div>
          )}

          {!hasAny && (
            <div className="flex flex-col items-center justify-center text-center py-10 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
              <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Inbox className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium text-sm">No evidence attached</p>
              <p className="text-slate-500 text-xs mt-1">Staff did not include a chat log or screenshot for this moderation.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}