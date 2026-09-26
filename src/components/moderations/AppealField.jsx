import { forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

const AppealField = forwardRef(function AppealField({ id, label, value, onChange, placeholder, min, max, rows = 3, onKeyDown }, ref) {
  const count = value.trim().length;
  const tooShort = count > 0 && count < min;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label} <span className="text-rose-400">*</span>
      </label>
      <div className="rounded-md bg-slate-900/60 border border-slate-800 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-colors">
        <Textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={max}
          rows={rows}
          className="bg-transparent border-0 shadow-none text-white placeholder:text-slate-600 resize-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-3 pb-2 text-[11px]">
          <span className="text-amber-400/90">{tooShort ? `At least ${min} characters` : ''}</span>
          <span className={`font-mono ${tooShort ? 'text-amber-400' : count >= min ? 'text-emerald-400' : 'text-slate-500'}`}>{count}/{max}</span>
        </div>
      </div>
    </div>
  );
});

export default AppealField;