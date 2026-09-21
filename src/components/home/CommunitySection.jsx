import { MessageCircle, ExternalLink, Users, Clock, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DISCORD_URL, GROUP_URL } from '@/lib/siteLinks';

const perks = [
  { icon: Users, label: 'Active Members' },
  { icon: Clock, label: '24/7 Community' },
  { icon: BadgeCheck, label: 'Official Server' },
];

export default function CommunitySection() {
  return (
    <section id="community" className="px-5 py-16 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-8 sm:p-14 shadow-2xl shadow-cyan-950/50 text-center">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-600/20 blur-[100px]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-5">
              <MessageCircle className="h-3.5 w-3.5" /> Community
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Join the Community</h2>
            <p className="mt-4 text-slate-300 max-w-xl mx-auto">Stay up to date with announcements, events, updates, and more. Chat with other players and the staff team.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 h-12 px-7">
                  <MessageCircle className="h-5 w-5 mr-2" /> Join Discord <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
              <a href={GROUP_URL} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                  Roblox Group <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-slate-300">
              {perks.map((p) => (
                <span key={p.label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"><p.icon className="h-3.5 w-3.5 text-cyan-300" /> {p.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}