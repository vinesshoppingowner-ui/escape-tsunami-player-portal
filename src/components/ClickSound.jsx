import { useEffect, useRef } from 'react';
import { useUserPrefs } from '@/lib/userPrefs';

let audioCtx = null;

function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    // Two-layer click: a soft pop + a subtle tick for depth
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.connect(popGain);
    popGain.connect(ctx.destination);
    pop.type = 'sine';
    pop.frequency.setValueAtTime(620, t);
    pop.frequency.exponentialRampToValueAtTime(280, t + 0.05);
    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    pop.start(t);
    pop.stop(t + 0.08);

    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    tick.connect(tickGain);
    tickGain.connect(ctx.destination);
    tick.type = 'triangle';
    tick.frequency.setValueAtTime(1500, t);
    tickGain.gain.setValueAtTime(0.0001, t);
    tickGain.gain.exponentialRampToValueAtTime(0.03, t + 0.002);
    tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    tick.start(t);
    tick.stop(t + 0.04);
  } catch { /* audio not available */ }
}

export default function ClickSound() {
  const prefs = useUserPrefs();
  const enabled = prefs.click_sounds !== false;
  const ref = useRef(enabled);
  ref.current = enabled;

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      const el = e.target.closest('button, a, [role="button"]');
      if (el && !el.disabled && !el.dataset?.noClickSound) playClick();
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, []);

  return null;
}