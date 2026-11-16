
import React from "react";
import { Link } from "react-router-dom";
import {
  Waves,
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

export default function AuthLayout({
  icon: Icon,
  title,
  subtitle,
  footer,
  children
}) {
  return (
    <div className="dark min-h-screen bg-[#080b14] text-white relative isolate overflow-hidden">

      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 left-[15%] w-[750px] h-[600px] rounded-full bg-cyan-500/[0.12] blur-[150px]" />
        <div className="absolute top-[35%] right-[-180px] w-[600px] h-[600px] rounded-full bg-blue-600/[0.13] blur-[150px]" />
        <div className="absolute bottom-[-250px] left-[35%] w-[600px] h-[500px] rounded-full bg-indigo-600/[0.10] blur-[150px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080b14]/10 to-[#080b14]/70" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-2">

        {/* Left branding panel */}
        <div className="relative min-h-[260px] lg:min-h-screen">
          <AuthBrandPanel />
        </div>

        {/* Right authentication section */}
        <main className="relative flex flex-col justify-center items-center px-5 sm:px-8 py-14 lg:py-12 min-h-screen">

          {/* Top navigation */}
          <Link
            to="/"
            className="absolute top-5 right-5 sm:top-7 sm:right-7 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.035] border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="w-full max-w-[430px]">

            {/* Mobile brand */}
            <Link
              to="/"
              className="lg:hidden flex items-center justify-center gap-3 mb-9"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/20">
                <Waves className="h-6 w-6 text-white" strokeWidth={2.5} />
              </span>

              <span className="text-left">
                <span className="block text-sm font-bold text-white">
                  Escape Tsunami for Developers
                </span>
                <span className="block text-[9px] tracking-[0.22em] font-bold text-cyan-400">
                  PLAYER PORTAL
                </span>
              </span>
            </Link>

            {/* Heading */}
            <div className="mb-7 text-center lg:text-left">

              {Icon && (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-blue-500/10 border border-cyan-400/20 shadow-lg shadow-cyan-950/20 mb-5">
                  <Icon
                    className="w-5 h-5 text-cyan-300"
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-300/80">
                  Secure Authentication
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-[34px] font-bold tracking-tight text-white">
                {title}
              </h1>

              {subtitle && (
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Authentication card */}
            <div className="relative">

              {/* Card glow */}
              <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-indigo-500/20 blur-sm opacity-70 pointer-events-none" />

              <div className="relative bg-[#111521]/90 backdrop-blur-2xl rounded-[20px] border border-white/[0.09] shadow-2xl shadow-black/40 p-5 sm:p-7">

                {/* Top accent */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                {children}

              </div>
            </div>

            {/* Footer */}
            {footer && (
              <div className="text-center text-sm text-slate-400 mt-6 leading-relaxed">
                {footer}
              </div>
            )}

            {/* Security footer */}
            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>Protected account authentication</span>
              <span className="text-slate-700">•</span>
              <Sparkles className="w-3 h-3 text-cyan-500/70" />
              <span>Escape Tsunami Portal</span>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
