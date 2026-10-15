import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function StaffSection() {
  return (
    <section className="max-w-[1220px] mx-auto px-5 md:px-[86px] py-16">
      <div className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-8 sm:p-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-7 w-7 text-cyan-400" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">How we keep the game fair</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Our moderation team works around the clock to keep Escape Tsunami for Developers fun and safe for everyone.
          If you have been moderated, you can view your full history and submit an appeal through the Member Portal.
        </p>
        <Link
          to="/portal"
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-sm font-semibold text-white hover:bg-white/[0.1] transition-colors"
        >
          Visit Member Portal
        </Link>
      </div>
    </section>
  );
}