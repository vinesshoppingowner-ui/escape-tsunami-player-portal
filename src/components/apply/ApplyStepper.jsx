const isEmpty = (a) => a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0);

export default function ApplyStepper({ questions, answers, step, onJump }) {
  const total = questions.length;
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {questions.map((q, i) => {
        const done = !isEmpty(answers[q.id]);
        const active = i === step;
        return (
          <button
            key={q.id}
            onClick={() => onJump(i)}
            title={`Question ${i + 1}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${active ? 'bg-cyan-400' : done ? 'bg-cyan-500/50' : 'bg-white/10 hover:bg-white/20'}`}
          />
        );
      })}
      <button
        onClick={() => onJump(total)}
        title="Review"
        className={`h-1.5 w-6 rounded-full transition-colors ${step >= total ? 'bg-emerald-400' : 'bg-white/10 hover:bg-white/20'}`}
      />
    </div>
  );
}