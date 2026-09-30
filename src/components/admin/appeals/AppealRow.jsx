import { useUserPrefs } from '@/lib/userPrefs';
import { cardFor } from '@/components/admin/appeals/cards/appealCards';
import { isWebsiteBanAppeal } from '@/lib/banAppealGuard';
import { Globe } from 'lucide-react';

// Renders the appeal using the card style the staff member picked in Settings.
export default function AppealRow(props) {
  const { appeal_card_style } = useUserPrefs();
  const Card = cardFor(appeal_card_style);
  if (!isWebsiteBanAppeal(props.appeal)) return <Card {...props} />;
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-1.5">
      <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-300">
        <Globe className="h-3.5 w-3.5" /> Website ban appeal · Admin only
      </div>
      <Card {...props} />
    </div>
  );
}