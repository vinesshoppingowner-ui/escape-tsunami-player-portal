
import React, { useState, useEffect } from "react";
import {
  loadCredentials,
  saveCredentials,
  isRememberEnabled,
  setRememberEnabled
} from "@/lib/savedLogin";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  LogIn,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import GoogleIcon from "@/components/GoogleIcon";
import MicrosoftIcon from "@/components/MicrosoftIcon";
import AppleIcon from "@/components/AppleIcon";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import { markJustLoggedIn } from "@/lib/userPrefs";
import {
  isPasscodeLoginAvailable,
  tryPasscodeLogin
} from "@/lib/passcodeLogin";
import PasscodeKeypad from "@/components/profile/PasscodeKeypad";

const INPUT =
  "w-full h-12 rounded-xl border border-white/[0.08] bg-[#0a101c]/80 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/50 focus:bg-[#101a2a] transition-all duration-200";

const SOCIAL_BUTTON =
  "w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.09] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.09] hover:border-cyan-400/30 hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0";

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

    if (params.get("banned") === "1") {
      setError(
        "Your portal account has been banned. Contact staff if you believe this is a mistake."
      );
    } else if (params.get("google_locked") === "1") {
      setError(
        "Google login is locked for your account. Use email and password to log in."
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    loadCredentials()
      .then((c) => {
        if (!active || !c) return;

        setSavedEmail(c.email || "");
        setEmail(c.email || "");

        if (c.password) {
          setPassword(c.password);
        }
      })
      .catch(() => {
        // Saved credentials are optional.
      });

    return () => {
      active = false;
    };
  }, []);

  const performLogin = async (emailValue, passwordValue) => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await base44.auth.loginViaEmailPassword(
        emailValue.trim(),
        passwordValue
      );

      localStorage.setItem("login_method", "password");

      setRememberEnabled(remember, emailValue.trim());

      if (remember) {
        await saveCredentials(emailValue.trim(), passwordValue);
      }

      markJustLoggedIn();
      window.location.href = returnTo;

    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const getProviderReturnTo = (provider) => {
    const sep = returnTo.includes("?") ? "&" : "?";
    return `${returnTo}${sep}login_method=${provider}`;
  };

  const handleGoogle = () => {
    const destination = getProviderReturnTo("google");

    localStorage.setItem("login_method", "google");
    base44.auth.loginWithProvider("google", destination);
  };

  const handleMicrosoft = () => {
    const destination = getProviderReturnTo("microsoft");

    localStorage.setItem("login_method", "microsoft");
    base44.auth.loginWithProvider("microsoft", destination);
  };

  const handleApple = () => {
    const destination = getProviderReturnTo("apple");

    localStorage.setItem("login_method", "apple");
    base44.auth.loginWithProvider("apple", destination);
  };

  const handlePasscode = (code) => {
    if (tryPasscodeLogin(code)) {
      markJustLoggedIn();
      window.location.href = returnTo;
    } else {
      setPasscodeError("Wrong passcode. Try again.");
    }
  };

  const switchTab = (tab) => {
    setLoginTab(tab);
    setError("");
    setPasscodeError("");
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
            to={
              "/register" +
              (returnTo !== "/"
                ? "?returnTo=" + encodeURIComponent(returnTo)
                : "")
            }
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Sign up
          </Link>
        </>
      }
    >

      <div className="space-y-5">

        {/* Account security indicator */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                Player Portal
              </p>
              <p className="text-[10px] text-slate-500">
                Secure account access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/[0.07] border border-emerald-400/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] tracking-wide font-bold text-emerald-300">
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Login tabs */}
        {hasPasscode && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#090e18] border border-white/[0.07]">

            <button
              type="button"
              onClick={() => switchTab("standard")}
              className={`h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                loginTab === "standard"
                  ? "bg-white/[0.09] text-white shadow-sm border border-white/[0.08]"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email & Social
            </button>

            <button
              type="button"
              onClick={() => switchTab("passcode")}
              className={`h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                loginTab === "passcode"
                  ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20 shadow-sm"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Quick Passcode
            </button>

          </div>
        )}

        {/* Passcode login */}
        {hasPasscode && loginTab === "passcode" ? (

          <div className="rounded-xl bg-[#090e18]/70 border border-white/[0.07] p-4 space-y-4">

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-cyan-300" />
              </div>

              <h3 className="text-sm font-bold text-white">
                Quick login
              </h3>

              <p className="text-xs text-slate-500">
                Enter your saved 4-digit device passcode.
              </p>
            </div>

            {passcodeError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                {passcodeError}
              </div>
            )}

            <div className="flex justify-center py-2">
              <PasscodeKeypad
                onComplete={handlePasscode}
                title="Quick login"
                subtitle="Enter your 4-digit device passcode"
              />
            </div>

            <p className="text-center text-[10px] text-slate-600">
              Protected device authentication
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {/* Social login */}
            <div className="space-y-2.5">

              <button
                type="button"
                onClick={handleGoogle}
                className="group w-full h-12 rounded-xl bg-white text-[#151515] text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:translate-y-0"
              >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>

              <div className="grid grid-cols-2 gap-2.5">

                <button
                  type="button"
                  onClick={handleMicrosoft}
                  className={SOCIAL_BUTTON}
                >
                  <MicrosoftIcon className="w-4 h-4" />
                  Microsoft
                </button>

                <button
                  type="button"
                  onClick={handleApple}
                  className={SOCIAL_BUTTON}
                >
                  <AppleIcon className="w-4 h-4" />
                  Apple
                </button>

              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                Or sign in with email
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Saved account */}
            {savedEmail && email === savedEmail && (
              <div className="px-3 py-2.5 rounded-xl bg-cyan-500/[0.07] border border-cyan-400/15 flex items-center justify-between gap-2">

                <span className="inline-flex items-center gap-2 text-xs text-cyan-200 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">
                    Saved account: <strong>{savedEmail}</strong>
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setPassword("");
                    setSavedEmail("");
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  Switch
                </button>

              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3.5 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-300"
                >
                  Email address
                </label>

                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-300"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative group">

                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) =>
                      setCapsLock(
                        e.getModifierState("CapsLock")
                      )
                    }
                    className={INPUT}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>

                {capsLock && (
                  <p className="text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    Caps Lock is on
                  </p>
                )}
              </div>

              {/* Remember login */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-500 cursor-pointer"
                />

                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  Remember my login on this device
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-cyan-500/20 hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Sign in to Portal
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

            </form>

          </div>
        )}

        {/* Bottom decoration */}
        <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-600">
          <Sparkles className="w-3 h-3 text-cyan-500/60" />
          Escape Tsunami for Developers
        </div>

      </div>
    </AuthLayout>
  );
}
