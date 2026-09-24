import { Check } from 'lucide-react';
import { APPEAL_CARDS } from '@/components/admin/appeals/cards/appealCards';

const SAMPLE_APPEAL = {
  id: 'preview',
  roblox_username: 'Builderman',
  status: 'Pending',
  appeal_reason: 'I was falsely banned — I was just standing near the exploiter when it happened.',
  created_date: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
  assigned_to: 'Max',
};
const SAMPLE_MOD = { moderation_type: 'Permanent Ban', reason: 'Exploiting' };

export default function AppealStylePicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {APPEAL_CARDS.map(({ value: v, label, desc, Card }) => {
        const active = value === v;
        return (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`text-left rounded-xl border p-2 transition-all ${active ? 'border-cyan-400/60 bg-cyan-500/10' : 'border-white/10 hover:border-white/25'}`}>
            <div className="relative h-36 overflow-hidden rounded-lg bg-slate-950 pointer-events-none">
              <div className="absolute left-0 top-0 w-[250%] origin-top-left scale-[0.4] p-3">
                <Card appeal={SAMPLE_APPEAL} moderation={SAMPLE_MOD} checked={false} onToggle={() => {}} onOpen={() => {}} busy={false} onAction={() => {}} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{label}</span>
              {active && <Check className="h-4 w-4 text-cyan-300" />}
            </div>
            <p className="px-1 text-[11px] text-slate-400">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}