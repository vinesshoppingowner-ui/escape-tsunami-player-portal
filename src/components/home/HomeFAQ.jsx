import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const FAQS = [
  { q: 'Is it free?', a: 'Yes! Escape Tsunami for Developers is completely free to play on Roblox. You can optionally purchase in-game boosts and cosmetics, but the core game is free forever.' },
  { q: 'Does it work on mobile?', a: 'Yes, the game works on all devices that support Roblox: phones, tablets, PCs, and consoles. The controls are optimized for touch and keyboard.' },
  { q: 'How do rebirths work?', a: 'When you rebirth, your progress resets but you earn a permanent multiplier that boosts all future earnings. The more you rebirth, the faster you grow.' },
  { q: 'Can I appeal a ban or warning?', a: 'Yes. If you have been moderated in-game, you can view your moderation history and submit an appeal through the Member Portal. Our staff team reviews every appeal.' },
  { q: 'Do my Developers keep earning while I am offline?', a: 'Yes! Your Developers continue generating coins even when you are not playing. Log back in to collect your earnings.' },
];

export default function HomeFAQ() {
  return (
    <section className="max-w-[800px] mx-auto px-5 md:px-8 py-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="rounded-xl bg-white/[0.03] border border-white/10 px-4">
            <AccordionTrigger className="text-sm font-medium text-white text-left hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-400 leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}