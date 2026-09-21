import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

export default function AdminMoreMenu({ items, value, onSelect }) {
  if (!items.length) return null;
  const activeItem = items.find((i) => i.value === value);
  const ActiveIcon = activeItem?.icon;

  return (
    <div className="flex items-center gap-1 ml-auto pl-1">
      <span className="h-5 w-px bg-white/10" />
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`group shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors data-[state=open]:bg-white/10 data-[state=open]:text-white ${
            activeItem
              ? 'bg-white/10 border-white/15 text-white'
              : 'bg-transparent border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          {ActiveIcon ? <ActiveIcon className="h-3.5 w-3.5" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
          {activeItem ? activeItem.label : 'More'}
          <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 bg-slate-900/95 backdrop-blur-xl border-white/10 text-slate-200 shadow-xl shadow-slate-950/60"
        >
          {items.map(({ value: v, label, icon: Icon }) => (
            <DropdownMenuItem
              key={v}
              onClick={() => onSelect(v)}
              className={`gap-2 py-2 cursor-pointer rounded-lg focus:bg-white/10 focus:text-white ${
                v === value ? 'bg-white/[0.06] text-cyan-300' : ''
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}