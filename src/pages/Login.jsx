import React, { useState, useEffect } from "react";
import { loadCredentials, saveCredentials } from "@/lib/savedLogin";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, LogIn } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import MicrosoftIcon from "@/components/MicrosoftIcon";
import AppleIcon from "@/components/AppleIcon";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import { markJustLoggedIn } from "@/lib/userPrefs";

const INPUT = "w-full h-11 rounded-lg border border-white/10 bg-white/[0.03] pl-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/60 transition-colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const returnTo = safeReturnTo();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('banned') === '1') setError('Your portal account has been banned. Contact staff if you believe this is a mistake.');
    else if (params.get('google_locked') === '1') setError('Google login is locked for your account. Use email and password to log in.');
  }, []);

  useEffect(() => {
    loadCredentials().then((c) => {
      if (!c) return;
      setEmail(c.email || "");
      if (c.password) setPassword(c.password);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      localStorage.setItem('login_method', 'password');
      await saveCredentials(email, password);
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
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-neutral-100 transition-colors"
      >
        <GoogleIcon className="w-5 h-5" />
        Continue with Google
      </button>

      <div className="grid grid-cols-2 gap-2.5 mt-2.5">
        <button
          type="button"
          onClick={handleMicrosoft}
          className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors"
        >
          <MicrosoftIcon className="w-4 h-4" />
          Microsoft
        </button>
        <button
          type="button"
          onClick={handleApple}
          className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors"
        >
          <AppleIcon className="w-4 h-4" />
          Apple
        </button>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">or with email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
            <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${INPUT} pr-3`} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
            <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`${INPUT} pr-10`} required />
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</>) : (<>Log in <ArrowRight className="w-4 h-4 ml-1.5" /></>)}
        </button>
      </form>
    </AuthLayout>
  );
}