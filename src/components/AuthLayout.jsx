import React from "react";
import { Link } from "react-router-dom";
import { Waves } from "lucide-react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

// Branded shell shared by login, sign-up, forgot and reset password pages.
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="dark min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <div className="absolute -top-32 left-1/3 h-[500px] w-[700px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <AuthBrandPanel />

        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[420px]">
            <Link to="/" className="lg:hidden flex justify-center mb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
                <Waves className="h-6 w-6 text-white" strokeWidth={2.5} />
              </span>
            </Link>
            <div className="text-center lg:text-left mb-7">
              {Icon && (
                <div className="hidden lg:inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                  <Icon className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                </div>
              )}
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="text-sm text-slate-400 mt-1.5">{subtitle}</p>}
            </div>
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-cyan-950/40 p-7">
              {children}
            </div>
            {footer && <p className="text-center text-sm text-slate-400 mt-6">{footer}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}