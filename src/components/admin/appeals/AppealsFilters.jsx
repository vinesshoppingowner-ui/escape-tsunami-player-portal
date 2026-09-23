import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { APPEAL_STATUSES } from '@/components/admin/appeals/appealMeta';

const MOD_TYPES = ['Warning', 'Mute', 'Kick', 'Temporary Ban', 'Permanent Ban'];
const opts = (list, allLabel) => [{ value: 'all', label: allLabel }, ...list.map((v) => ({ value: v, label: v }))];

export default function AppealsFilters({ filters, onChange }) {
  const set = (k) => (v) => onChange({ ...filters, [k]: v });
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={filters.search}
          onChange={(e) => set('search')(e.target.value)}
          placeholder="Search player or appeal text…"
          className="pl-9 pr-8 h-10 bg-white/5 border-white/10 text-white rounded-lg"
        />
        {filters.search && (
          <button onClick={() => set('search')('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 md:w-[480px]">
        <CustomDropdown value={filters.status} onChange={set('status')} options={opts(APPEAL_STATUSES, 'All statuses')} buttonClassName="h-10" />
        <CustomDropdown value={filters.priority} onChange={set('priority')} options={opts(['High', 'Medium', 'Low'], 'All priorities')} buttonClassName="h-10" />
        <CustomDropdown value={filters.type} onChange={set('type')} options={opts(MOD_TYPES, 'All types')} buttonClassName="h-10" />
      </div>
    </div>
  );
}