import { ScrollText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageShell from '@/components/PageShell';

const RULES = [
  { title: 'Be respectful', text: 'No harassment, hate speech, discrimination, or targeted bullying toward any player or staff member.' },
  { title: 'No exploiting or cheating', text: 'Using exploits, scripts, macros, or third-party tools to gain an unfair advantage results in a permanent ban.' },
  { title: 'Keep chat appropriate', text: 'No spamming, advertising, bypassing the chat filter, or sharing inappropriate content.' },
  { title: 'No scamming or trading abuse', text: 'Do not attempt to scam, deceive, or exploit other players in any way.' },
  { title: 'No impersonation', text: 'Pretending to be staff, developers, or another player is strictly prohibited.' },
  { title: 'Follow Roblox Terms of Service', text: 'All Roblox Community Standards apply at all times inside Escape Tsunami For Developers.' },
  { title: 'Respect staff decisions', text: 'Staff have final say in-game. If you disagree with a moderation, submit an appeal through the Member Portal.' },
];

export default function Rules() {
  return (
    <PageShell badge="Community Guidelines" icon={ScrollText} title="Rules" text="Breaking these rules may result in a warning, mute, kick, or ban. Play fair and keep the community fun for everyone." tone="rose">
      <ol className="space-y-3">
        {RULES.map((r, i) => (
          <li key={r.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <span className="shrink-0 h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-sm font-bold text-rose-300">{i + 1}</span>
            <div>
              <h3 className="font-semibold text-white">{r.title}</h3>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">{r.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300">Think a moderation was a mistake? You can review your history and submit an appeal in the <Link to="/portal" className="text-amber-300 hover:text-amber-200 underline underline-offset-2">Member Portal</Link>.</p>
      </div>
    </PageShell>
  );
}