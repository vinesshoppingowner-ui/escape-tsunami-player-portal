export default function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* hover aura */}
      <span className="absolute -inset-2 rounded-[18px] bg-cyan-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* glass tile */}
      <span className="relative h-full w-full overflow-hidden rounded-[12px] bg-[radial-gradient(130%_110%_at_22%_-10%,#7dd3fc_0%,#22a6f0_42%,#1e40af_100%)] ring-1 ring-white/30 shadow-[0_8px_22px_rgba(6,18,42,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.65),inset_0_-8px_14px_-8px_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-[1.06]">
        {/* top specular sheen */}
        <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 via-white/10 to-transparent" />
        {/* diagonal light streak */}
        <span className="absolute -left-2 -top-3 h-10 w-4 rotate-[26deg] bg-white/20 blur-[3px]" />

        {/* tsunami crest */}
        <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full drop-shadow-[0_1px_2px_rgba(0,28,72,0.55)]" fill="none">
          <path
            d="M5 21.5c2.6-6.6 6-10.4 10.2-10.4 3.5 0 5.6 2.3 5.6 5 0 1.8-1.1 3.1-2.6 3.1-1.2 0-2-.7-2-1.7 0-.9.6-1.5 1.4-1.5"
            stroke="white"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path d="M4 24.6c2.4 0 3.2 1.5 5.6 1.5s3.2-1.5 5.6-1.5 3.2 1.5 5.6 1.5 3.2-1.5 5.6-1.5" stroke="white" strokeOpacity="0.9" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M6.5 15.2c1.3-.9 2.2-1 3.4-.4" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        {/* bottom inner shade */}
        <span className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-blue-950/40 to-transparent" />
      </span>
    </span>
  );
}