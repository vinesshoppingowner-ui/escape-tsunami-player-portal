import React, { useState, useEffect } from "react";
import { loadCredentials, saveCredentials, isRememberEnabled, setRememberEnabled } from "@/lib/savedLogin";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, LogIn, AlertTriangle, KeyRound, CheckCircle2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import MicrosoftIcon from "@/components/MicrosoftIcon";
import AppleIcon from "@/components/AppleIcon";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import { markJustLoggedIn } from "@/lib/userPrefs";
import { isPasscodeLoginAvailable, tryPasscodeLogin } from "@/lib/passcodeLogin";
import PasscodeKeypad from "@/components/profile/PasscodeKeypad";

const INPUT = "w-full h-11 rounded-lg border border-white/10 bg-white/[0.03] pl-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/60 transition-colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => isRememberEnabled());
  const [capsLock, setCapsLock] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [loginTab, setLoginTab] = useState("standard");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const returnTo = safeReturnTo();
  const hasPasscode = isPasscodeLoginAvailable();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('banned') === '1') setError('Your portal account has been banned. Contact staff if you believe this is a mistake.');
    else if (params.get('google_locked') === '1') setError('Google login is locked for your account. Use email and password to log in.');
  }, []);

  useEffect(() => {
    loadCredentials().then((c) => {
      if (!c) return;
      setEmail(c.email || "");
      setSavedEmail(c.email || "");
      if (c.password) setPassword(c.password);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      localStorage.setItem('login_method', 'password');
      setRememberEnabled(remember, email.trim());
      if (remember) await saveCredentials(email.trim(), password);
      markJustLoggedIn();
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const sep = returnTo.includes('?') ? '&' : '?';
    const googleReturnTo = `${returnTo}${sep}login_method=google`;
    localStorage.setItem('login_method', 'google');
    markJustLoggedIn();
    base44.auth.loginWithProvider("google", googleReturnTo);
  };

  const handleMicrosoft = () => {
    const sep = returnTo.includes('?') ? '&' : '?';
    const microsoftReturnTo = `${returnTo}${sep}login_method=microsoft`;
    localStorage.setItem('login_method', 'microsoft');
    markJustLoggedIn();
    base44.auth.loginWithProvider("microsoft", microsoftReturnTo);
  };

  const handleApple = () => {
    const sep = returnTo.includes('?') ? '&' : '?';
    const appleReturnTo = `${returnTo}${sep}login_method=apple`;
    localStorage.setItem('login_method', 'apple');
    markJustLoggedIn();
    base44.auth.loginWithProvider("apple", appleReturnTo);
  };

  const handlePasscode = (code) => {
    if (tryPasscodeLogin(code)) {
      markJustLoggedIn();
      window.location.href = returnTo;
    } else {
      setPasscodeError("Wrong passcode. Try again.");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to check your standing and appeals"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Sign up
          </Link>
        </>
      }
    >
      {hasPasscode && (
        <div className="grid grid-cols-2 gap-1 p-1 mb-5 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => setLoginTab("standard")}
            className={`h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              loginTab === "standard" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email & Social
          </button>
          <button
            type="button"
            onClick={() => setLoginTab("passcode")}
            className={`h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              loginTab === "passcode" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Quick Passcode
          </button>
        </div>
      )}

      {hasPasscode && loginTab === "passcode" ? (
        <div className="py-2">
          {passcodeError && (
            <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{passcodeError}</div>
          )}
          <PasscodeKeypad
            onComplete={handlePasscode}
            title="Quick login"
            subtitle="Enter your 4-digit device passcode"
          />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full h-11 rounded-lg bg-white text-black text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-neutral-100 transition-all shadow-sm"
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            <button
              type="button"
              onClick={handleMicrosoft}
              className="w-full h-10 rounded-lg bg-white/[0.06] border border-white/10 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/[0.12] transition-colors"
            >
              <MicrosoftIcon className="w-4 h-4" />
              Microsoft
            </button>
            <button
              type="button"
              onClick={handleApple}
              className="w-full h-10 rounded-lg bg-white/[0.06] border border-white/10 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/[0.12] transition-colors"
            >
              <AppleIcon className="w-4 h-4" />
              Apple
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">or sign in with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {savedEmail && email === savedEmail && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between gap-2 text-xs text-cyan-200">
              <span className="inline-flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Saved account: <strong className="truncate">{savedEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => { setEmail(""); setPassword(""); setSavedEmail(""); }}
                className="text-[11px] text-slate-400 hover:text-white shrink-0"
              >
                Switch
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-slate-300">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${INPUT} pr-3`} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLock(e.getModifierState && e.getModifierState("CapsLock"))}
                  className={`${INPUT} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {capsLock && (
                <p className="text-[11px] text-amber-300 flex items-center gap-1 pt-0.5">
                  <AlertTriangle className="w-3 h-3" /> Caps Lock is on
                </p>
              )}
            </div>

            <label className="flex items-center justify-between gap-2 cursor-pointer select-none pt-0.5">
              <span className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-cyan-500"
                />
                Remember my login on this device
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</>) : (<>Sign in to Portal <ArrowRight className="w-4 h-4 ml-1.5" /></>)}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}