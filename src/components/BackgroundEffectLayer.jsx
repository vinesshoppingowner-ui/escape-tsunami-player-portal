import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useUserPrefs } from '@/lib/userPrefs';
import { BG_EFFECTS, canUseBgEffects } from '@/lib/backgroundEffects';

// Full-screen animated canvas (thunderstorm, snow, leaves…) drawn behind the page content.
export default function BackgroundEffectLayer() {
  const { user } = useAuth();
  const prefs = useUserPrefs();
  const key = canUseBgEffects(user) && !prefs.reduce_motion ? prefs.background_effect : 'none';
  const active = !!BG_EFFECTS[key]?.create;
  const ref = useRef(null);

  useEffect(() => {
    const el = document.documentElement;
    if (active) el.dataset.fx = key; else delete el.dataset.fx;
    if (!active) return;

    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const fx = BG_EFFECTS[key].create();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w, h, raf, last = performance.now();

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.resize(w, h);
    };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      fx.draw(ctx, w, h, now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); delete el.dataset.fx; };
  }, [key, active]);

  if (!active) return null;
  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}