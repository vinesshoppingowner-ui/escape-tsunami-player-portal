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
      </Group>
      <Group title="Presentation" subtitle="Manage how the form and responses are presented">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-2">Form presentation</p>
        <Row k="showProgressBar" label="Show progress bar" {...p} />
        <Row k="shuffleQuestions" label="Shuffle question order" {...p} />
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-3">After submission</p>
        <Row k="showSubmitAnother" label="Show link to submit another response" desc="Only works when 'Limit to 1 response' is off" {...p} />
        <Row k="showResultsSummary" label="View results summary" desc="Show respondents how many responses have been submitted" {...p} />
      </Group>
      <Group title="Restrictions">
        <Row k="disableAutosave" label="Disable autosave for all respondents" desc="Drafts won't be saved in the browser" {...p} />
      </Group>
    </div>
  );
}