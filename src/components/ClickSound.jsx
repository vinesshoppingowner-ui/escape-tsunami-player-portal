import { useEffect, useRef } from 'react';
import { useUserPrefs } from '@/lib/userPrefs';

let audioCtx = null;

function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
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