import AppealCardStandard from '@/components/admin/appeals/cards/AppealCardStandard';
import AppealCardProfessional from '@/components/admin/appeals/cards/AppealCardProfessional';
import AppealCardSpotlight from '@/components/admin/appeals/cards/AppealCardSpotlight';

export const APPEAL_CARDS = [
  { value: 'standard', label: 'Standard', desc: 'Ticket cards with quote and details.', Card: AppealCardStandard },
  { value: 'professional', label: 'Professional', desc: 'Dense, table-like rows for fast triage.', Card: AppealCardProfessional },
  { value: 'spotlight', label: 'Spotlight', desc: 'Big, bold cards with large avatars.', Card: AppealCardSpotlight },
];

export const cardFor = (style) => (APPEAL_CARDS.find((c) => c.value === style) || APPEAL_CARDS[0]).Card;