export default function ResponseStats({ responses }) {
  const n = responses.length;
  const decided = responses.filter((r) => r.status === 'accepted' || r.status === 'rejected');
  const accepted = responses.filter((r) => r.status === 'accepted').length;
  const scored = responses.filter((r) => r.ai_score != null);
  const rated = responses.filter((r) => r.staff_rating);
  const stats = [
    ['Awaiting review', responses.filter((r) => r.status === 'submitted').length],
    ['Acceptance rate', decided.length ? `${Math.round((accepted / decided.length) * 100)}%` : '—'],
    ['Avg AI score', scored.length ? Math.round(scored.reduce((s, r) => s + r.ai_score, 0) / scored.length) : '—'],
    ['Avg staff rating', rated.length ? `${(rated.reduce((s, r) => s + r.staff_rating, 0) / rated.length).toFixed(1)}★` : '—'],
    ['Shortlisted', responses.filter((r) => r.starred).length],
  ];
  if (!n) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-px rounded-xl overflow-hidden border border-white/10 bg-white/10">
      {stats.map(([l, v]) => (
        <div key={l} className="bg-slate-950 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">{l}</div>
          <div className="text-lg font-semibold text-white">{v}</div>
        </div>
      ))}
    </div>
  );
}