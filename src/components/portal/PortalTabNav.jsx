import { LayoutDashboard, Shield, ScrollText, Trophy, Lock, LifeBuoy } from 'lucide-react';

export const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'moderations', label: 'Moderations', icon: Shield },
  { id: 'appeals', label: 'Appeals', icon: ScrollText },
  { id: 'rewards', label: 'Rewards', icon: Trophy },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

export default function PortalTabNav({ activeTab, onTabChange, badgeCounts = {} }) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-48 shrink-0" role="tablist" aria-label="Portal sections">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const badge = badgeCounts[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${active ? 'text-cyan-400' : ''}`} />
              {tab.label}
              {badge > 0 && (
                <span className="ml-auto h-4 min-w-4 px-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B0D13]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]"
        role="tablist"
        aria-label="Portal sections"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const badge = badgeCounts[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center gap-0.5 py-2 px-2 flex-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg ${
                active ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              <span className="text-[9px] font-medium">{tab.label}</span>
              {badge > 0 && (
                <span className="absolute top-1 right-1/4 h-3.5 min-w-3.5 px-1 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}