import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Sparkles, Settings } from 'lucide-react';

import Toggle from './FormToggle';

function Row({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-sm text-slate-300">{label}</Label>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={!!checked} onChange={onChange} />
    </div>
  );
}

const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500';

export default function ApplicationAdvancedSettings({ settings, update }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300"><Settings className="h-4 w-4" /> Submission rules</div>
        <Row label="One Response Per User" desc="Prevent users from submitting multiple times" checked={settings.oneResponsePerUser} onChange={(v) => update('oneResponsePerUser', v)} />
        <Row label="Require Roblox Verification" desc="Applicant must have a verified Roblox account" checked={settings.requireRobloxVerification} onChange={(v) => update('requireRobloxVerification', v)} />
        <Row label="Show Progress Bar" desc="Display completion progress to applicants" checked={settings.showProgressBar} onChange={(v) => update('showProgressBar', v)} />
        <Row label="Shuffle Question Order" desc="Each applicant sees the questions in a random order" checked={settings.shuffleQuestions} onChange={(v) => update('shuffleQuestions', v)} />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Response limit (0 = unlimited)</Label>
            <Input type="number" min="0" value={settings.responseLimit ?? 0} onChange={(e) => update('responseLimit', parseInt(e.target.value) || 0)} className={inputCls} />
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Minimum account age (days)</Label>
            <Input type="number" min="0" value={settings.minAccountAgeDays ?? 0} onChange={(e) => update('minAccountAgeDays', parseInt(e.target.value) || 0)} className={inputCls} />
          </div>
        </div>
        <p className="text-[11px] text-slate-500">Account age counts from when the applicant joined this portal. The form closes automatically once the response limit is reached.</p>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300"><RotateCcw className="h-4 w-4" /> Retakes</div>
        <Row label="Allow retakes after rejection" desc="Rejected applicants can apply again after a cooldown" checked={settings.allowRetake} onChange={(v) => update('allowRetake', v)} />
        {settings.allowRetake && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Cooldown (days)</Label>
              <Input type="number" min="0" value={settings.retakeCooldownDays ?? 0} onChange={(e) => update('retakeCooldownDays', parseInt(e.target.value) || 0)} className={inputCls} />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Max attempts (0 = unlimited)</Label>
              <Input type="number" min="0" value={settings.maxAttempts ?? 0} onChange={(e) => update('maxAttempts', parseInt(e.target.value) || 0)} className={inputCls} />
            </div>
          </div>
        )}
        <p className="text-[11px] text-slate-500">You can also grant a single applicant a retake from their response.</p>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-violet-500/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-300"><Sparkles className="h-4 w-4" /> AI screening</div>
        <Row label="Auto AI-check every submission" desc="Each response gets a score, summary and red flags when submitted" checked={settings.aiReviewEnabled} onChange={(v) => update('aiReviewEnabled', v)} />
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">What should the AI look for?</Label>
          <Textarea value={settings.aiCriteria || ''} onChange={(e) => update('aiCriteria', e.target.value)} placeholder="e.g. Must be 13+, active in the game, calm under pressure, gives detailed scenario answers…" className={`${inputCls} min-h-[70px]`} />
        </div>
      </div>
    </div>
  );
}