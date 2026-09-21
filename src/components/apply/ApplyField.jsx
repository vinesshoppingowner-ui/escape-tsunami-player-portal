import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-base rounded-xl focus-visible:ring-cyan-500/50';

function ChoiceRow({ selected, onClick, label, multi }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center gap-3 text-left rounded-xl border px-4 py-3 transition-all ${selected ? 'bg-cyan-500/15 border-cyan-500/40 text-white' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/20'}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${multi ? 'rounded-md' : 'rounded-full'} ${selected ? 'bg-cyan-500 border-cyan-400' : 'border-white/30'}`}>
        {selected && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function ApplyField({ q, value, onChange, autoFocus }) {
  switch (q.type) {
    case 'textarea':
      return (
        <div>
          <Textarea autoFocus={autoFocus} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Type your answer…'} maxLength={q.maxLength || undefined} className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[160px] text-base rounded-xl focus-visible:ring-cyan-500/50" />
          {q.maxLength > 0 && <div className="mt-1.5 text-right text-xs text-slate-500">{(value || '').length}/{q.maxLength}</div>}
        </div>
      );
    case 'number':
      return <Input autoFocus={autoFocus} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Enter a number…'} className={inputCls} />;
    case 'email':
      return <Input autoFocus={autoFocus} type="email" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'name@example.com'} className={inputCls} />;
    case 'date':
      return <Input autoFocus={autoFocus} type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
    case 'dropdown':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={inputCls}><SelectValue placeholder="Select an option…" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10 text-white">
            {(q.options || []).map((opt, i) => <SelectItem key={i} value={opt} className="focus:bg-cyan-500/15 focus:text-white">{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    case 'radio':
      return <div className="space-y-2">{(q.options || []).map((opt, i) => <ChoiceRow key={i} label={opt} selected={value === opt} onClick={() => onChange(opt)} />)}</div>;
    case 'checkbox': {
      const arr = Array.isArray(value) ? value : [];
      return <div className="space-y-2">{(q.options || []).map((opt, i) => <ChoiceRow key={i} multi label={opt} selected={arr.includes(opt)} onClick={() => onChange(arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt])} />)}</div>;
    }
    case 'rating':
      return (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => onChange(n)} className="p-1 transition-transform hover:scale-110">
              <Star className={`h-9 w-9 transition-colors ${(value || 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'}`} />
            </button>
          ))}
        </div>
      );
    case 'yesno':
      return (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onChange(true)} className={`h-14 rounded-xl text-base font-medium border transition-colors ${value === true ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>Yes</button>
          <button type="button" onClick={() => onChange(false)} className={`h-14 rounded-xl text-base font-medium border transition-colors ${value === false ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>No</button>
        </div>
      );
    default:
      return <Input autoFocus={autoFocus} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Type your answer…'} maxLength={q.maxLength || undefined} className={inputCls} />;
  }
}