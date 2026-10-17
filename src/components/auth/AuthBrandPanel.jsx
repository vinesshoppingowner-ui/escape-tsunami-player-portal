import { Link } from "react-router-dom";
import { Waves, ShieldCheck, ScrollText, MessagesSquare, Bell } from "lucide-react";

const FEATURES = [
  { icon: ScrollText, title: "Complete Moderation History", text: "Inspect every warning, mute, kick, and ban linked to your Roblox account with evidence." },
  { icon: MessagesSquare, title: "Real-Time Appeal Threads", text: "Submit appeals, attach clips or screenshots, and chat directly with reviewing staff." },
  { icon: Bell, title: "Applications & Instant Alerts", text: "Apply for open staff or developer roles and get notified the moment a decision lands." },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 border-r border-white/10 bg-gradient-to-b from-cyan-500/[0.08] via-slate-950 to-indigo-950/20 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <Waves className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-white text-lg leading-tight">
            Escape Tsunami for Developers
            <span className="block text-[10px] font-normal text-cyan-300/80 tracking-[0.18em] uppercase">Player Portal</span>
          </span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Systems Online
        </span>
      </div>

      <div className="my-auto py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-5">
          <ShieldCheck className="h-3.5 w-3.5" /> Official Member & Staff Hub
        </div>
        <h2 className="font-display text-4xl font-bold tracking-tight text-white leading-tight">
          Your standing, appeals & applications,<br />
          <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">all in one secure place.</span>
        </h2>
        <div className="mt-8 space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-cyan-500/25 transition-colors">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Icon className="h-5 w-5 text-cyan-300" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
        <span>© {new Date().getFullYear()} Escape Tsunami for Developers</span>
        <span className="text-slate-400">Encrypted OAuth & Passcode Ready</span>
      </div>
    </div>
  );
}