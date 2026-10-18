import { useState } from 'react';
import { Heart, MessageSquareOff, Users, ShieldCheck, Bug, ChevronDown } from 'lucide-react';

const TIPS = [
  {
    icon: Heart,
    text: 'Always respect other players — toxicity earns fast mutes.',
    penalty: 'Mute · 1h–24h',
    severity: 'amber',
    detail: 'Harassment, insults, or targeted toxicity in chat or voice will result in an immediate mute and escalate to temporary bans for repeat offenses.',
  },
  {
    icon: MessageSquareOff,
    text: 'Avoid spamming in chat — repeated messages trigger auto-mod.',
    penalty: 'Auto-Mute',
    severity: 'emerald',
    detail: 'Flooding the chat with repeated messages, ASCII art, or all-caps lines automatically triggers in-game chat cooldowns and mutes.',
  },
  {
    icon: Users,
    text: 'Follow staff instructions — arguing with mods only makes things worse.',
    penalty: 'Warning / Kick',
    severity: 'amber',
    detail: 'If you disagree with a moderation action, remain respectful in-game and submit a formal appeal here in the Member Portal.',
  },
  {
    icon: ShieldCheck,
    text: 'No exploiting or glitching — fair play keeps the game fun for everyone.',
    penalty: 'Permanent Ban',
    severity: 'rose',
    detail: 'Using third-party scripts, movement exploits, or intentional map glitches carries a zero-tolerance permanent ban.',
  },
  {
    icon: Bug,
    text: 'Report bugs, don\u2019t abuse them — bug abusers get banned too.',
    penalty: 'Temp / Perm Ban',
    severity: 'rose',
    detail: 'Found a broken mechanic or map spot? Submit a Bug Report on your Overview tab instead of using it for an unfair advantage.',
  },
];

const SEVERITY_TAG = {
  emerald: {
    color: '#37d49b',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.28)',
  },
  amber: {
    color: '#f7b84f',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.33)',
  },
  rose: {
    color: '#fb7185',
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
  },
};

export default function GoodStandingTips() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <section className="studio-card flex flex-col justify-start gap-[15px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-[10px] text-[15px] leading-[1.35] font-semibold tracking-[-0.02em] text-[#f3f5f7]">
          <span
            className="grid place-items-center flex-none w-[31px] h-[31px] rounded-[9px]"
            style={{
              color: '#f0b94d',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              background: 'rgba(245, 158, 11, 0.09)',
            }}
          >
            <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.6 3 8.1 7 10 4-1.9 7-5.4 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div>
            <div>Ways to stay in Good Standing</div>
            <div className="text-xs font-normal text-[#a0a7b4] mt-0.5">
              Click any rule below to view enforcement details and penalty tiers.
            </div>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {TIPS.map((tip, i) => {
          const isOpen = expandedIndex === i;
          const tagStyle = SEVERITY_TAG[tip.severity];
          return (
            <li
              key={i}
              className="rounded-[12px] bg-[#1c202b] border border-[#303541] hover:border-[#4b5662] transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{
                      color: '#f0b94d',
                      border: '1px solid rgba(245, 158, 11, 0.22)',
                      background: 'rgba(245, 158, 11, 0.08)',
                    }}
                  >
                    <tip.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-[#eef1f5] font-medium leading-snug">
                    {tip.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                    style={tagStyle}
                  >
                    {tip.penalty}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#a0a7b4] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#f3f5f7]' : ''
                    }`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3 pt-1 border-t border-white/[0.05] text-xs text-[#a0a7b4] leading-relaxed flex flex-col gap-1.5">
                  <div className="sm:hidden">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                      style={tagStyle}
                    >
                      Penalty: {tip.penalty}
                    </span>
                  </div>
                  <p>{tip.detail}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}