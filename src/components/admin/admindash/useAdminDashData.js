import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Loads everything the Admin Dashboard needs in one go.
export function useAdminDashData() {
  const [data, setData] = useState(null);

  const load = async () => {
    const [appeals, mods, logs, bugs, verifs, users] = await Promise.all([
      base44.entities.Appeal.list('-updated_date', 1000),
      base44.entities.Moderation.list('-created_date', 1000),
      base44.entities.StaffLog.list('-created_date', 1000),
      base44.entities.BugReport.list('-created_date', 200),
      base44.entities.VerificationRequest.list('-created_date', 200),
      base44.entities.User.list().catch(() => []),
    ]);
    setData({ appeals, mods, logs, bugs, verifs, users });
  };

  useEffect(() => { load(); }, []);
  return { data, reload: load };
}