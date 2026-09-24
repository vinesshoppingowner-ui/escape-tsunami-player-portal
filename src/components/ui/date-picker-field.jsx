import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Dark themed date picker. Value/onChange use 'yyyy-MM-dd' strings.
export default function DatePickerField({ value, onChange, placeholder = 'Pick a date' }) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={`flex items-center justify-between w-full h-9 px-3 rounded-lg bg-slate-900/60 border text-sm transition-colors ${open ? 'border-cyan-400/50' : 'border-white/15 hover:border-white/25'}`}>
          <span className={date ? 'text-white' : 'text-slate-500'}>{date ? format(date, 'MMM d, yyyy') : placeholder}</span>
          <CalendarDays className="h-4 w-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2 rounded-xl bg-slate-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl shadow-black/50">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => { onChange(d ? format(d, 'yyyy-MM-dd') : ''); setOpen(false); }}
          disabled={{ after: new Date() }}
          className="text-white"
          classNames={{
            cell: 'relative p-0 text-center text-sm',
            day: 'h-8 w-8 p-0 font-normal rounded-md text-slate-200 hover:bg-white/10 inline-flex items-center justify-center transition-colors',
            day_selected: 'bg-cyan-500 text-white hover:bg-cyan-500 focus:bg-cyan-500 rounded-md',
            day_today: 'border border-cyan-400/40 rounded-md',
            day_outside: 'text-slate-600 opacity-60',
            day_disabled: 'text-slate-700 opacity-40',
            head_cell: 'text-slate-500 rounded-md w-8 font-normal text-[0.8rem]',
            nav_button: 'h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:text-white',
          }}
        />
      </PopoverContent>
    </Popover>
  );
}