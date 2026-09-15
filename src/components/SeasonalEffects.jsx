import { useMemo } from 'react';

/**
 * Renders seasonal visual effects based on the active season.
 * Winter: falling snow particles + icy background glow.
 */
export default function SeasonalEffects({ season }) {
  const flakes = useMemo(() => {
    if (season !== 'winter') return [];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 15,
      size: 2 + Math.random() * 5,
      opacity: 0.15 + Math.random() * 0.45,
    }));
  }, [season]);

  if (season !== 'winter') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Icy winter glow at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-blue-500/[0.07] blur-[150px]" />
      <div className="absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-cyan-400/[0.05] blur-[130px]" />

      {/* Falling snow */}
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full bg-white will-change-transform"
          style={{
            left: `${f.left}%`,
            top: '-12px',
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}