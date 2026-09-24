import { useUserPrefs } from '@/lib/userPrefs';
import { cardFor } from '@/components/admin/appeals/cards/appealCards';

// Renders the appeal using the card style the staff member picked in Settings.
export default function AppealRow(props) {
  const { appeal_card_style } = useUserPrefs();
  const Card = cardFor(appeal_card_style);
  return <Card {...props} />;
}