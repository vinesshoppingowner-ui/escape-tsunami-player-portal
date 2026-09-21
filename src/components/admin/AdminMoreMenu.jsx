import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

export default function AdminMoreMenu({ items, value, onSelect }) {
  if (!items.length) return null;
  const activeItem = items.find((i) => i.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          activeItem ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
        {activeItem ? activeItem.label : 'More'}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-slate-200">
        {items.map(({ value: v, label, icon: Icon }) => (
          <DropdownMenuItem
            key={v}
            onClick={() => onSelect(v)}
            className={`gap-2 cursor-pointer focus:bg-white/10 focus:text-white ${v === value ? 'text-cyan-300' : ''}`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}