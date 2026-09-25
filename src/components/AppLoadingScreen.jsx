const ICON = 'https://media.base44.com/images/public/6a94d0a4d41cd1f012a10c06/b60ae6e74_generated_image.png';

export default function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050a14] overflow-hidden px-6">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-blue-600/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-[28px] bg-cyan-400/30 blur-xl animate-pulse-slow" />
          <img src={ICON} alt="Escape Tsunami" className="relative h-24 w-24 rounded-[28px] border border-white/15 shadow-2xl shadow-black/60" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-white tracking-tight">Escape Tsunami</h1>
        <p className="mt-1 text-sm text-slate-400">Member Portal</p>

        <div className="mt-8 h-1 w-40 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-[loadbar_1.2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`@keyframes loadbar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      <div className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] text-[11px] text-slate-600">Loading your account…</div>
    </div>
  );
}