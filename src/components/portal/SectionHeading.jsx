export default function SectionHeading({ title, note }) {
  return (
    <div className="mt-12 mb-4 flex items-baseline justify-between gap-4 border-b border-white/10 pb-2">
      <h2 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
      {note && <span className="text-xs text-slate-500">{note}</span>}
    </div>
  );
}