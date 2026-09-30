export default function FormToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-block h-6 w-11 shrink-0 rounded-full p-0 transition-colors ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}