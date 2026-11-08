import { Label } from '@/components/ui/label';
import FormToggle from './FormToggle';

function Row({ label, desc, k, settings, update }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-t border-white/5 first:border-t-0">
      <div>
        <Label className="text-sm text-slate-200">{label}</Label>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <FormToggle checked={!!settings[k]} onChange={(v) => update(k, v)} />
    </div>
  );
}

function Group({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-2">{subtitle}</p>}
      {children}
    </div>
  );
}

export default function ApplicationFormSettings({ settings, update }) {
  const p = { settings, update };
  return (
    <div className="space-y-4">
      <Group title="Responses" subtitle="Manage how responses are collected and protected">
        <Row k="collectEmail" label="Collect email addresses" desc="Save the applicant's portal email with their response" {...p} />
        <Row k="sendCopy" label="Send responders a copy of their response" desc="Emailed to the applicant after submitting" {...p} />
        <Row k="allowEditing" label="Allow response editing" desc="Responses can be changed after being submitted (until staff review them)" {...p} />
        <Row k="oneResponsePerUser" label="Limit to 1 response" desc="Requires sign in" {...p} />
        <Row k="discordAlert" label="Discord alert on new submission" desc="Notify the staff Discord channel whenever an applicant submits" {...p} />
      </Group>
      <Group title="Presentation" subtitle="Manage how the form and responses are presented">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-2">Form presentation</p>
        <Row
          k="promotePopover"
          label="Suggest applying via Applications tab popover"
          desc="Shows a dismissible 'Hi! Suggest applying — check it out' popover pointing at the Applications tab for all visitors"
          {...p}
        />
        {settings.promotePopover && (
          <div className="py-2.5 border-t border-white/5 space-y-1.5">
            <Label className="text-xs text-slate-300">Custom popover message (optional)</Label>
            <input
              type="text"
              value={settings.promoteMessage || ''}
              onChange={(e) => update('promoteMessage', e.target.value)}
              placeholder="We suggest applying for this application — check it out!"
              className="w-full h-9 rounded-lg bg-slate-950 border border-white/10 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
            />
          </div>
        )}
        <Row k="showProgressBar" label="Show progress bar" {...p} />
        <Row k="singlePageMode" label="All questions on one page" desc="Show every question on a single scrollable page instead of step-by-step cards" {...p} />
        <Row k="shuffleQuestions" label="Shuffle question order" {...p} />
        <div className="flex items-center justify-between gap-4 py-3 border-t border-white/5">
          <div>
            <Label className="text-sm text-slate-200">Time limit (minutes)</Label>
            <p className="text-xs text-slate-500 mt-0.5">Optional countdown timer once the applicant starts (0 = no time limit)</p>
          </div>
          <input
            type="number"
            min="0"
            max="180"
            value={settings.timeLimitMinutes || 0}
            onChange={(e) => update('timeLimitMinutes', Math.max(0, Number(e.target.value) || 0))}
            className="h-9 w-24 rounded-lg bg-slate-950 border border-white/10 px-3 text-sm text-white text-right focus:outline-none focus:border-cyan-500/40"
          />
        </div>
        <div className="py-3 border-t border-white/5 space-y-1.5">
          <Label className="text-sm text-slate-200">Custom submission agreement text</Label>
          <p className="text-xs text-slate-500">Shown next to the required checkbox before submitting (leave blank for default honesty pledge)</p>
          <textarea
            value={settings.customTermsText || ''}
            onChange={(e) => update('customTermsText', e.target.value)}
            placeholder="I confirm my answers are my own original work..."
            rows={2}
            className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
          />
        </div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-3">After submission</p>
        <Row k="showSubmitAnother" label="Show link to submit another response" desc="Only works when 'Limit to 1 response' is off" {...p} />
        <Row k="showResultsSummary" label="View results summary" desc="Show respondents how many responses have been submitted" {...p} />
      </Group>
      <Group title="Restrictions">
        <Row k="disableAutosave" label="Disable autosave for all respondents" desc="Drafts won't be saved in the browser" {...p} />
        <Row k="blockCopyPaste" label="Block copy & paste" desc="Disables copying, pasting, right-click, text selection, and keyboard shortcuts like Ctrl+C / F12" {...p} />
      </Group>
    </div>
  );
}