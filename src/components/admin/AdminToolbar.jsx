import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown } from 'lucide-react';

// Admin-only tools shown as their own row of tabs with a gold accent.
export default function AdminToolbar({ items }) {
  return (
    <TabsList className="mt-2 flex w-full flex-wrap justify-start gap-1 p-1.5 bg-amber-500/[0.05] border border-amber-500/20 h-auto rounded-xl">
      <span className="inline-flex items-center gap-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">
        <Crown className="h-3.5 w-3.5" /> Admin
      </span>
      {items.map(({ value, label, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className="shrink-0 gap-1.5 px-3 py-2 text-sm text-slate-400 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-100 rounded-lg"
        >
          <Icon className="h-3.5 w-3.5" /> {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}