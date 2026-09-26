import SectionLabel from '@/components/SectionLabel';

export default function ReviewAppealAnswers({ appeal }) {
  const items = [
    ['1. What happened?', appeal.appeal_reason],
    ['2. Why should your appeal be accepted?', appeal.why_accepted],
    ['3. Did you deserve this infraction in your opinion?', appeal.deserved_infraction],
  ].filter(([, v]) => v);
  return (
    <div className="space-y-3">
      <SectionLabel>Player's appeal</SectionLabel>
      {items.map(([q, a]) => (
        <div key={q}>
          <div className="text-xs text-slate-500 mb-0.5">{q}</div>
          <p className="text-sm text-slate-200 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  );
}