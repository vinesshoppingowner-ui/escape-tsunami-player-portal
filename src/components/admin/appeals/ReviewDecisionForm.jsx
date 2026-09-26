import { Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import CustomDropdown from '@/components/ui/custom-dropdown';
import SectionLabel from '@/components/SectionLabel';
import { RESPONSE_TEMPLATES, fillTemplate, buildTemplateVars } from '@/lib/responseTemplates';

const STATUSES = ['Pending', 'Under Review', 'Approved', 'Denied'];
const field = 'bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-indigo-500';

export default function ReviewDecisionForm({ appeal, moderation, user, draft, setDraft, canDecide }) {
  return (
    <div className="space-y-3">
      <SectionLabel>Staff decision</SectionLabel>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-48">
          <label className="text-xs text-slate-400 mb-1 block">Decision</label>
          <CustomDropdown
            value={draft.status}
            onChange={(v) => setDraft({ ...draft, status: v })}
            options={STATUSES.filter((s) => canDecide || s === appeal.status || !['Approved', 'Denied'].includes(s)).map((s) => ({ value: s, label: s }))}
            placeholder="Select decision"
          />
          {draft.status === 'Denied' && (
            <label className="mt-2 flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={draft.can_reappeal} onChange={(e) => setDraft({ ...draft, can_reappeal: e.target.checked })} className="mt-0.5 h-4 w-4 rounded accent-indigo-500" />
              <span>Allow this player to submit a new appeal</span>
            </label>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">Staff response (shown to player)</label>
            <CustomDropdown
              value=""
              onChange={(v) => {
                const t = RESPONSE_TEMPLATES.find((x) => x.label === v);
                if (t) setDraft({ ...draft, staff_response: fillTemplate(t.text, buildTemplateVars({ appeal, moderation, user })) });
              }}
              options={RESPONSE_TEMPLATES.map((t) => ({ value: t.label, label: t.label }))}
              placeholder="Templates…"
              buttonClassName="h-7 text-xs"
            />
          </div>
          <Textarea rows={2} value={draft.staff_response} onChange={(e) => setDraft({ ...draft, staff_response: e.target.value })} className={field} placeholder="Explain the decision…" />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-slate-500" /> Internal notes (staff only)
        </label>
        <Textarea rows={2} value={draft.internal_notes} onChange={(e) => setDraft({ ...draft, internal_notes: e.target.value })} className={field} placeholder="Private context for the mod team…" />
      </div>
    </div>
  );
}