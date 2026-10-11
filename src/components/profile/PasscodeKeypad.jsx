import { useState, useCallback } from 'react';
import { Delete, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PasscodeKeypad({ onComplete, length = 4, title, subtitle }) {
  const [code, setCode] = useState('');

  const press = useCallback((digit) => {
    setCode((prev) => {
      if (prev.length >= length) return prev;
      const next = prev + digit;
      if (next.length === length) {
        // Defer so the dot renders before onComplete fires
        setTimeout(() => onComplete(next), 120);
      }
      return next;
    });
  }, [length, onComplete]);

  const remove = useCallback(() => setCode((p) => p.slice(0, -1)), []);

  return (
    <div className="flex flex-col items-center w-full max-w-[260px] mx-auto">
      {title && <p className="text-sm font-semibold text-white mb-0.5">{title}</p>}
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}

      {/* Dots */}
      <div className="flex gap-3 mb-6">
        {Array.from({ length }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: code.length > i ? 1 : 0.85 }}
            className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
              code.length > i ? 'bg-cyan-400 border-cyan-400' : 'border-white/20 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <KeypadButton key={n} onClick={() => press(String(n))}>{n}</KeypadButton>
        ))}
        <KeypadButton onClick={remove} variant="ghost">
          <Delete className="h-4 w-4" />
        </KeypadButton>
        <KeypadButton onClick={() => press('0')}>0</KeypadButton>
        <KeypadButton variant="ghost" disabled>
          <Shield className="h-4 w-4 opacity-30" />
        </KeypadButton>
      </div>
    </div>
  );
}

function KeypadButton({ children, onClick, variant = 'default', disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-14 rounded-xl flex items-center justify-center text-lg font-semibold transition-all active:scale-95 ${
        variant === 'ghost'
          ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.06]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}