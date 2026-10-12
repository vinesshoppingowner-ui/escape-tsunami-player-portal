import { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
};

export default function CountUp({ value, loading, error, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  const showDash = loading || error || value == null;

  useEffect(() => {
    if (showDash || !inView) return;
    if (reduceMotion) { setDisplay(value); return; }
    const startVal = 0;
    const endVal = value;
    const startTime = Date.now();
    const duration = 1500;
    let raf;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(startVal + (endVal - startVal) * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [showDash, inView, value, reduceMotion]);

  if (showDash) return <span ref={ref}>—</span>;
  return <span ref={ref}>{fmtNum(display)}{suffix}</span>;
}