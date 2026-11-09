import { useState, useRef, useEffect } from 'react';
import {
  Type,
  AlignLeft,
  ImagePlus,
  Paperclip,
  Youtube,
  Code,
  ChevronDown,
  Circle,
  CheckSquare,
  ToggleLeft,
  UserCheck,
  Sliders,
  Gauge,
  Star,
  MessageSquare,
  Gamepad2,
  Globe,
  CalendarClock,
  Mail,
  Link,
  Hash,
  Calendar,
  LayoutList,
  Check,
  Search,
} from 'lucide-react';
import { QUESTION_TYPES } from '@/lib/applicationTypes';
import NewBadge from '@/components/ui/new-badge';

const ICON_MAP = {
  Type,
  AlignLeft,
  ImagePlus,
  Paperclip,
  Youtube,
  Code,
  ChevronDown,
  Circle,
  CheckSquare,
  ToggleLeft,
  UserCheck,
  Sliders,
  Gauge,
  Star,
  MessageSquare,
  Gamepad2,
  Globe,
  CalendarClock,
  Mail,
  Link,
  Hash,
  Calendar,
  LayoutList,
};

export default function QuestionTypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = QUESTION_TYPES.find((t) => t.value === value) || QUESTION_TYPES[0];
  const SelectedIcon = ICON_MAP[selected.icon] || Type;

  const filtered = QUESTION_TYPES.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.label.toLowerCase().includes(q) || (t.group || '').toLowerCase().includes(q) || t.value.toLowerCase().includes(q);
  });

  const groups = Array.from(new Set(filtered.map((t) => t.group || 'Other')));

  return (
    <div ref={ref} className="relative sm:w-64 shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 w-full h-11 px-3.5 rounded-xl bg-slate-950/90 border text-sm text-white transition-all ${
          open
            ? 'border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
            : 'border-white/15 hover:border-cyan-500/40 hover:bg-slate-900/90'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0 truncate">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 shrink-0">
            <SelectedIcon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate font-medium">{selected.label}</span>
          {selected.isNew && <NewBadge />}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180 text-cyan-300' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl bg-[#0d111d]/98 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/70 overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question types…"
                autoFocus
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 space-y-2">
            {groups.map((group) => (
              <div key={group}>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {filtered
                    .filter((t) => (t.group || 'Other') === group)
                    .map((opt) => {
                      const Icon = ICON_MAP[opt.icon] || Type;
                      const isSel = opt.value === value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onChange(opt.value);
                            setOpen(false);
                            setSearch('');
                          }}
                          className={`flex items-center justify-between gap-2 w-full px-2.5 py-2 rounded-xl text-xs transition-colors ${
                            isSel
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-semibold'
                              : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-lg shrink-0 ${
                                isSel
                                  ? 'bg-cyan-500/25 text-cyan-200'
                                  : 'bg-white/[0.04] text-slate-400'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="truncate">{opt.label}</span>
                            {opt.isNew && <NewBadge />}
                          </span>
                          {isSel && <Check className="h-3.5 w-3.5 shrink-0 text-cyan-300" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}