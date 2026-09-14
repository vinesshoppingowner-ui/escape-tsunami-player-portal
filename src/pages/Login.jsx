import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Waves, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="w-full max-w-[420px]">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Waves className="h-6 w-6 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display font-semibold text-white tracking-tight text-lg leading-tight text-left">
              Escape Tsunami
              <span className="block text-[10px] font-normal text-cyan-300/80 tracking-[0.18em] uppercase">For Developers</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Member Portal
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Log in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-cyan-950/40 p-7">
          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-neutral-100 transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>

          {/* OR divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-950/80 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                OR
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log in <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}