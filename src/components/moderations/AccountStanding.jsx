const SEVERITY = {
  Warning: 1,
  Mute: 2,
  Kick: 3,
  'Temporary Ban': 4,
  'Permanent Ban': 5,
};

const BADGE_STYLE = {
  emerald: {
    border: '1px solid rgba(16, 185, 129, 0.33)',
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#37d49b',
  },
  amber: {
    border: '1px solid rgba(245, 158, 11, 0.33)',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f7b84f',
  },
  rose: {
    border: '1px solid rgba(245, 158, 11, 0.33)',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f7b84f',
  },
};

export default function AccountStanding({ moderations = [] }) {
  const active = moderations.filter((m) => m.status === 'Active');
  const score = active.reduce((s, m) => s + (SEVERITY[m.moderation_type] || 1), 0);
  const hasPerm = active.some((m) => m.moderation_type === 'Permanent Ban');

  let level, color, pct, description, ringGradient;
  if (score === 0) {
    level = 'Good Standing';
    color = 'emerald';
    pct = 100;
    description = 'Your account is in great shape — keep it up!';
    ringGradient = 'conic-gradient(from -90deg, #10b981 0deg, #10b981 360deg)';
  } else if (hasPerm || score >= 4) {
    level = 'At Risk';
    color = 'rose';
    pct = 15;
    description = 'Active bans on your account — review below.';
    ringGradient = 'conic-gradient(from -90deg, #10b981 0deg, #10b981 132deg, #f59e0b 225deg, #303642 225deg, #303642 360deg)';
  } else {
    level = 'Warning';
    color = 'amber';
    pct = 60;
    description = 'Some active moderations — be mindful of the rules.';
    ringGradient = 'conic-gradient(from -90deg, #10b981 0deg, #10b981 160deg, #f59e0b 255deg, #303642 255deg, #303642 360deg)';
  }

  const markerLeft = 100 - pct;
  const badgeStyle = BADGE_STYLE[color];

  const counts = {
    warnings: active.filter((m) => m.moderation_type === 'Warning').length,
    mutesKicks: active.filter((m) => m.moderation_type === 'Mute' || m.moderation_type === 'Kick').length,
    bans: active.filter((m) => m.moderation_type === 'Temporary Ban' || m.moderation_type === 'Permanent Ban').length,
  };

  return (
    <section className="studio-card">
      {/* Topline */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[15px] leading-[1.3] font-semibold tracking-[-0.02em] text-[#f3f5f7]">
              Account Standing
            </div>
            <div className="mt-1 text-[#a0a7b4] text-xs leading-[1.5]">
              {description}
            </div>
          </div>
        </div>
        <span
          className="flex-none px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.03em]"
          style={badgeStyle}
        >
          {level}
        </span>
      </div>

      {/* Gauge Row + Legend + Infraction Breakdown */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-[18px]">
        <div className="flex items-center gap-[18px]">
          <div
            className="studio-ring"
            style={{ background: ringGradient }}
            aria-hidden="true"
          >
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold tabular-nums text-[#f3f5f7] leading-none">
                {pct}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#a0a7b4] mt-0.5">
                Health
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 flex-1">
            <div className="flex items-center gap-[9px] text-[#b6bdc8] text-[10px] font-semibold tracking-[0.11em] leading-none">
              <i
                className="w-[7px] h-[7px] rounded-full inline-block"
                style={{ background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,.42)' }}
              />
              <span>GOOD</span>
              {level === 'Good Standing' && (
                <span className="text-[9px] tracking-normal font-medium text-[#37d49b] ml-1">● Current</span>
              )}
            </div>
            <div className="flex items-center gap-[9px] text-[#b6bdc8] text-[10px] font-semibold tracking-[0.11em] leading-none">
              <i
                className="w-[7px] h-[7px] rounded-full inline-block"
                style={{ background: '#c6a451', boxShadow: '0 0 9px rgba(245,158,11,.25)' }}
              />
              <span>WARNING</span>
              {level === 'Warning' && (
                <span className="text-[9px] tracking-normal font-medium text-[#f7b84f] ml-1">● Current</span>
              )}
            </div>
            <div className="flex items-center gap-[9px] text-[#b6bdc8] text-[10px] font-semibold tracking-[0.11em] leading-none">
              <i
                className="w-[7px] h-[7px] rounded-full inline-block"
                style={{ background: '#f59e0b', boxShadow: '0 0 9px rgba(245,158,11,.35)' }}
              />
              <span>AT RISK</span>
              {level === 'At Risk' && (
                <span className="text-[9px] tracking-normal font-medium text-[#f7b84f] ml-1">● Current</span>
              )}
            </div>
          </div>
        </div>

        {/* Structured Metric Breakdown Grid */}
        <div className="grid grid-cols-4 gap-2 sm:w-auto w-full pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          {[
            { label: 'Severity Pts', value: score, tone: score > 0 ? 'text-[#f7b84f]' : 'text-[#37d49b]' },
            { label: 'Warnings', value: counts.warnings, tone: 'text-[#f3f5f7]' },
            { label: 'Mutes/Kicks', value: counts.mutesKicks, tone: 'text-[#f3f5f7]' },
            { label: 'Active Bans', value: counts.bans, tone: counts.bans > 0 ? 'text-[#f7b84f]' : 'text-[#f3f5f7]' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] bg-[#1c202b] border border-[#303541] px-2.5 py-2 text-center"
            >
              <div className={`text-sm font-bold tabular-nums leading-tight ${stat.tone}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-[#a0a7b4] mt-0.5 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linear Track */}
      <div className="studio-track" aria-hidden="true">
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#191c24] shadow transition-all duration-500"
          style={{ left: `${markerLeft}%` }}
        />
      </div>
    </section>
  );
}