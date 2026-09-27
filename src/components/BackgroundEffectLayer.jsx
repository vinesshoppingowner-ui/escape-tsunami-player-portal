import { useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs } from '@/lib/userPrefs';
import { BG_EFFECTS, canUseBgEffects, makeParticles } from '@/lib/backgroundEffects';

// Animated background particles (rain, snow, leaves…) drawn behind the page content.
export default function BackgroundEffectLayer() {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const key = canUseBgEffects(user) && !prefs.reduce_motion ? prefs.background_effect : 'none';
  const fx = BG_EFFECTS[key];
  const active = fx && key !== 'none';
  const particles = useMemo(() => (active ? makeParticles(fx) : []), [key]);

  useEffect(() => {
    const el = document.documentElement;
    if (active) el.dataset.fx = key; else delete el.dataset.fx;
  }, [key, active]);

  if (!active) return null;

  return (
    <div className="fx-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`fx-p fx-${fx.anim} ${fx.cls || ''}`}
          style={{
            left: `${p.left}%`,
            top: fx.anim === 'twinkle' || fx.anim === 'float' ? `${p.top}%` : 0,
            width: fx.cls === 'fx-rain' ? 1 : p.size,
            height: p.size,
            fontSize: p.char ? p.size : undefined,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}