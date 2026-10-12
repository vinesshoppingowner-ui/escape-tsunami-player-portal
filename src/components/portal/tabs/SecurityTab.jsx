import SecurityCard from '@/components/portal/SecurityCard';

export default function SecurityTab({ portal }) {
  const { user, savedUsername } = portal;
  return <SecurityCard user={user} robloxUsername={savedUsername} />;
}