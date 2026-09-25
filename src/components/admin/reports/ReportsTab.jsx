import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2 } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import ReportSummary from '@/components/admin/reports/ReportSummary';
import { downloadCsv } from '@/lib/csv';

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const EXPORTS = {
  mods: [['roblox_username', 'Player'], ['moderation_type', 'Type'], ['reason', 'Reason'], ['duration', 'Duration'], ['status', 'Status'], ['staff_member', 'Staff'], ['moderation_date', 'Date']],
  appeals: [['roblox_username', 'Player'], ['status', 'Status'], ['appeal_reason', 'Reason'], ['assigned_to', 'Assigned to'], ['staff_response', 'Staff response'], ['created_date', 'Submitted']],
  logs: [['staff_username', 'Staff'], ['action', 'Action'], ['target', 'Target'], ['detail', 'Detail'], ['created_date', 'Date']],
};

export default function ReportsTab() {
  const [range, setRange] = useState('30');
  const [raw, setRaw] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Moderation.list('-created_date', 2000),
      base44.entities.Appeal.list('-created_date', 2000),
      base44.entities.StaffLog.list('-created_date', 2000),
    ]).then(([mods, appeals, logs]) => setRaw({ mods, appeals: appeals.filter((a) => !a.removed), logs }));
  }, []);

  if (!raw) return <div className="mt-6 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading reports…</div>;

  const since = range === 'all' ? 0 : Date.now() - Number(range) * 86400000;
  const inRange = (r) => new Date(r.created_date).getTime() >= since;
  const data = { mods: raw.mods.filter(inRange), appeals: raw.appeals.filter(inRange), logs: raw.logs.filter(inRange) };
  const stamp = new Date().toISOString().slice(0, 10);

  const exportCsv = (key, label) => downloadCsv(`${label}-${range}d-${stamp}.csv`, data[key], EXPORTS[key].map(([k, l]) => ({ key: k, label: l })));

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CustomDropdown value={range} onChange={setRange} options={RANGES} className="w-44" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {[['mods', 'moderations', 'Moderations'], ['appeals', 'appeals', 'Appeals'], ['logs', 'staff-logs', 'Staff logs']].map(([key, file, label]) => (
            <button key={key} onClick={() => exportCsv(key, file)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/15 bg-white/5 text-sm text-slate-200 hover:text-white">
              <Download className="h-4 w-4" /> {label} CSV
            </button>
          ))}
        </div>
      </div>
      <ReportSummary mods={data.mods} appeals={data.appeals} logs={data.logs} />
    </div>
  );
}