import { Link } from 'react-router-dom';
import { Mail, User } from 'lucide-react';

/**
 * Shown beneath the terms checkbox on the application submission screen.
 * Confirms which account the applicant is responding from, with a link to update it.
 */
export default function RespondingAs({ user }) {
  const roblox = user?.roblox_username || user?.data?.roblox_username;
  const email = user?.email;
  const label = roblox || email || 'Unknown account';
  const Icon = roblox ? User : Mail;

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
      <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      <span>
        I am responding from <span className="text-slate-200 font-medium">{label}</span>
      </span>
      <Link to="/portal" className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline">
        Change
      </Link>
    </div>
  );
}