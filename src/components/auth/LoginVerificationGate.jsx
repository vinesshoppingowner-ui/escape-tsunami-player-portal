import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Loader2, RefreshCw, Mail } from 'lucide-react';

const OTP_VERIFIED_KEY = 'et_otp_verified';

export function isOtpVerified(userId) {
  return sessionStorage.getItem(OTP_VERIFIED_KEY) === userId;
}

export function markOtpVerified(userId) {
  sessionStorage.setItem(OTP_VERIFIED_KEY, userId);
}

export default function LoginVerificationGate({ user, onVerified }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    sendCode();
    startResendTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const sendCode = async () => {
    setSending(true);
    setError('');
    try {
      await base44.functions.invoke('loginOtp', { action: 'send' });
    } catch (err) {
      setError('Failed to send verification code. Try again.');
    } finally {
      setSending(false);
    }
  };

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    sendCode();
    startResendTimer();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('loginOtp', { action: 'verify', code });
      if (res.data?.ok) {
        markOtpVerified(user.id);
        onVerified();
      } else {
        setError(res.data?.error || 'Verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Wrong code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#090c18] p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-4">
            <Shield className="h-7 w-7 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Verify it's you</h1>
          <p className="mt-2 text-sm text-slate-400">
            We sent a 6-digit code to{' '}
            <span className="text-slate-300 font-medium">{user?.email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full h-12 rounded-lg border border-white/10 bg-white/[0.03] text-center text-lg tracking-[0.5em] text-white placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/60 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>
            ) : (
              'Verify'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={sending}
              className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${sending ? 'animate-spin' : ''}`} /> Resend code
            </button>
          ) : (
            <span className="text-sm text-slate-500">Resend code in {resendTimer}s</span>
          )}
        </div>
      </div>
    </div>
  );
}