export default function SectionLabel({ children, className = '' }) {
  return (
    <div className={`pb-2 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`}>
      {children}
    </div>
  );
}