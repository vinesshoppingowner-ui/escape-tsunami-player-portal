import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckSquare, Square, MessageSquare, Copy, Check, ShieldCheck } from 'lucide-react';
import { safeParse } from '@/lib/safeParse';
import { useToast } from '@/components/ui/use-toast';
import NewBadge from '@/components/ui/new-badge';

const CHECKLIST_ITEMS = [
  { id: 'roblox_verified', label: 'Roblox profile & account standing checked' },
  { id: 'discord_present', label: 'Discord tag valid / in community server' },
  { id: 'age_eligible', label: 'Meets age & timezone requirements' },
  { id: 'original_work', label: 'Answers are original (no AI / copy-paste)' },
  { id: 'scenario_passed', label: 'Scenario & role questions meet bar' },
];

export default function StaffReviewToolkit({ response, application, onUpdate }) {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState('');

  const reviewObj = useMemo(() => safeParse(response.ai_review, {}), [response.ai_review]);
  const checklist = reviewObj.staff_checklist || {};
  const checkedCount = CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length;

  // Auto-extract Discord username/ID from questions or answers
  const discordHandle = useMemo(() => {
    const questions = safeParse(application.questions, []);
    const answers = safeParse(response.answers, {});
    const discordQ = questions.find(
      (q) => q.type === 'discord' || /discord/i.test(q.text || '')
    );
    if (discordQ && answers[discordQ.id]) {
      return String(answers[discordQ.id]).trim();
    }
    return '';
  }, [application.questions, response.answers]);

  const toggleItem = async (id) => {
    const nextChecklist = { ...checklist, [id]: !checklist[id] };
    const nextReview = { ...reviewObj, staff_checklist: nextChecklist };
    try {
      const updated = await base44.entities.ApplicationResponse.update(response.id, {
        ai_review: JSON.stringify(nextReview),
      });
      onUpdate(updated);
    } catch {
      toast({ title: 'Could not save checklist item', variant: 'destructive' });
    }
  };

  const copyText = (key, text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1800);
    toast({ title: label });
  };

  const applicantName = response.roblox_username || 'Applicant';

  const dmTemplates = {
    accept: `Hey **${applicantName}**! 🎉 Congratulations — your application for **${application.title}** in **Escape Tsunami for Developers** has been **ACCEPTED**!${response.applicant_feedback ? `\n\n> **Reviewer Note:** ${response.applicant_feedback}` : ''}\n\nPlease reply to this DM when you are ready for your onboarding and role setup!`,
    interview: `Hey **${applicantName}**! 👋 Your application for **${application.title}** in **Escape Tsunami for Developers** stood out to our review team and is currently **Shortlisted / Under Review**.\n\nWe'd love to ask you a couple quick follow-up questions here on Discord whenever you're free!`,
    reject: `Hello **${applicantName}**, thank you for applying for **${application.title}** in **Escape Tsunami for Developers**. After reviewing your submission, we aren't able to move forward at this time.${response.applicant_feedback ? `\n\n> **Feedback:** ${response.applicant_feedback}` : ''}\n\nWe appreciate your interest and encourage you to apply again in the future!`,
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-cyan-500/25 p-4 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white">Staff Verification & Discord Kit</span>
          <NewBadge />
        </div>
        <span className="text-[11px] font-semibold text-cyan-300 tabular-nums">
          {checkedCount}/{CHECKLIST_ITEMS.length} verified
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }}
        />
      </div>

      {/* Interactive Checklist */}
      <div className="space-y-1.5">
        {CHECKLIST_ITEMS.map((item) => {
          const done = Boolean(checklist[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border text-left text-xs transition-colors ${
                done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
              }`}
            >
              {done ? (
                <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Square className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              )}
              <span className={done ? 'line-through opacity-90' : ''}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1-Click Discord Outreach Kit */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            Discord Outreach DM Templates
          </span>
          {discordHandle && (
            <button
              type="button"
              onClick={() => copyText('handle', discordHandle, `Copied Discord: ${discordHandle}`)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[11px] text-indigo-200 hover:bg-indigo-500/25 truncate max-w-[150px]"
              title={`Copy Discord handle: ${discordHandle}`}
            >
              {copiedKey === 'handle' ? <Check className="h-3 w-3 text-emerald-400 shrink-0" /> : <Copy className="h-3 w-3 shrink-0" />}
              <span className="truncate">{discordHandle}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            ['accept', 'Accept DM', 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20'],
            ['interview', 'Interview DM', 'bg-violet-500/10 border-violet-500/25 text-violet-200 hover:bg-violet-500/20'],
            ['reject', 'Polite Reject', 'bg-rose-500/10 border-rose-500/25 text-rose-200 hover:bg-rose-500/20'],
          ].map(([key, label, cls]) => (
            <button
              key={key}
              type="button"
              onClick={() => copyText(key, dmTemplates[key], `${label} copied for Discord!`)}
              className={`h-8 px-2 rounded-lg border text-[11px] font-medium inline-flex items-center justify-center gap-1 transition-colors ${cls}`}
            >
              {copiedKey === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedKey === key ? 'Copied!' : label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}