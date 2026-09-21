import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { DISCORD_URL } from '@/lib/siteLinks';

const FAQS = [
  { q: 'How do I play Escape Tsunami For Developers?', a: 'Join the game on Roblox, sprint away from incoming tsunamis, and collect Developers around the map. Your Developers earn cash for you — even while you are offline.' },
  { q: 'What are Developers?', a: 'Developers are collectible characters with different rarities. Each one earns a set amount of cash per second. Rarer Developers earn more.' },
  { q: 'What does Rebirth do?', a: 'Rebirthing resets your progress in exchange for a permanent cash multiplier, letting you climb faster every run.' },
  { q: 'I was banned or warned — what can I do?', a: 'Open the Member Portal, verify your Roblox account, and you will see your full moderation history. From there you can submit an appeal to the staff team.' },
  { q: 'How do I verify my Roblox account?', a: 'The portal gives you a short code to paste into your Roblox profile bio. Once we detect it, your account is verified and the code can be removed.' },
  { q: 'How long do appeals take?', a: 'Most appeals are reviewed within a few days. You will receive an in-portal notification and an email when a decision is made.' },
  { q: 'How do I earn the Devoted Discord role?', a: 'Link your Discord in the Member Portal and claim your daily streak for 7 days in a row. The Devoted role is assigned automatically.' },
  { q: 'Where can I report a bug or get support?', a: 'Join our Discord server and open a support ticket — a staff member will help you out.' },
];

export default function FAQ() {
  return (
    <PageShell badge="Help Center" icon={HelpCircle} title="Frequently Asked Questions" text="Quick answers to the most common questions about the game and the Member Portal.">
      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-cyan-200">{f.q}</AccordionTrigger>
            <AccordionContent className="text-slate-400 leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="mt-8 text-sm text-slate-400">Still need help? <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Join our Discord</a> or read the <Link to="/rules" className="text-cyan-300 hover:text-cyan-200">Rules</Link>.</p>
    </PageShell>
  );
}