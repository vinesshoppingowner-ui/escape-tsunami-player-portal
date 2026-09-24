import { Link } from "react-router-dom";
import { Waves, ShieldCheck, ScrollText, MessagesSquare, Bell } from "lucide-react";

const FEATURES = [
  { icon: ScrollText, title: "Moderation history", text: "See every warning, mute and ban on your account." },
  { icon: MessagesSquare, title: "Appeal directly", text: "Submit appeals and chat live with staff." },
  { icon: Bell, title: "Instant updates", text: "Get notified the moment a decision is made." },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 border-r border-white/10 bg-gradient-to-b from-cyan-500/[0.07] to-transparent">
      <Link to="/" className="inline-flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
          <Waves className="h-6 w-6 text-white" strokeWidth={2.5} />
        </span>
        <span className="font-display font-semibold text-white text-lg leading-tight">
          Escape Tsunami
          <span className="block text-[10px] font-normal text-cyan-300/80 tracking-[0.18em] uppercase">Player Portal</span>
        </span>
      </Link>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 mb-5">
          <ShieldCheck className="h-3.5 w-3.5" /> Official Member Portal
        </div>
        <h2 className="font-display text-4xl font-bold tracking-tight text-white leading-tight">
          Your account,<br />
          <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">fully in your hands.</span>
        </h2>
        <div className="mt-10 space-y-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                <Icon className="h-5 w-5 text-cyan-300" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-sm text-slate-400">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">© {new Date().getFullYear()} Escape Tsunami. Not affiliated with Roblox Corporation.</p>
    </div>
  );
}