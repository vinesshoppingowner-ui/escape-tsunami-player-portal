import { useState, useCallback, useEffect } from 'react';
import { Delete, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PasscodeKeypad({ onComplete, onBack, length = 4, title, subtitle, glass = true }) {
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);

  // Reset dots when the parent changes the prompt (e.g. create → confirm)
  // and expose a reset function via a ref-like callback
  useEffect(() => {
    setCode('');
  }, [title, subtitle]);

  const press = useCallback((digit) => {
    setCode((prev) => {
      if (prev.length >= length) return prev;
      const next = prev + digit;
      if (next.length === length) {
        // Defer so the last dot renders before onComplete fires
        setTimeout(() => {
          onComplete(next);
          setCode('');
        }, 150);
      }
      return next;
    });
  }, [length, onComplete]);

  const remove = useCallback(() => setCode((p) => p.slice(0, -1)), []);

  const containerCls = glass
    ? 'liquid-glass rounded-2xl p-4'
    : '';

  return (
    <div className={`flex flex-col items-center w-full max-w-[280px] mx-auto ${containerCls}`}>
      {title && <p className="text-sm font-semibold text-white mb-0.5">{title}</p>}
      {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}

      {/* Dots */}
      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-3 mb-5"
      >
        {Array.from({ length }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: code.length > i ? 1 : 0.8 }}
            className={`h-3.5 w-3.5 rounded-full border-2 transition-colors duration-150 ${
              code.length > i
                ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                : 'border-white/25 bg-transparent'
            }`}
          />
        ))}
      </motion.div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <KeypadButton key={n} onClick={() => press(String(n))} glass={glass}>{n}</KeypadButton>
        ))}
        <KeypadButton onClick={remove} variant="ghost" glass={glass}>
          <Delete className="h-4 w-4" />
        </KeypadButton>
        <KeypadButton onClick={() => press('0')} glass={glass}>0</KeypadButton>
        {onBack ? (
          <KeypadButton onClick={onBack} variant="ghost" glass={glass}>
            <span className="text-xs">Back</span>
          </KeypadButton>
        ) : (
          <KeypadButton variant="ghost" disabled glass={glass}>
            <Shield className="h-4 w-4 opacity-30" />
          </KeypadButton>
        )}
      </div>
    </div>
  );
}

function KeypadButton({ children, onClick, variant = 'default', disabled, glass = true }) {
  const base = 'h-12 rounded-xl flex items-center justify-center text-base font-semibold transition-all duration-150 active:scale-90 select-none';
  const style = glass
    ? variant === 'ghost'
      ? 'text-slate-300 hover:text-white hover:bg-white/10'
      : 'bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/10 backdrop-blur-sm'
    : variant === 'ghost'
      ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
      : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.06]';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style} ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
}