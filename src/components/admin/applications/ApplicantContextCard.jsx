import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, CheckCircle2, Scale, History, Loader2 } from 'lucide-react';

export default function ApplicantContextCard({ username, currentResponseId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!username) {
      setData(null);
      return;
    }
    setLoading(true);
    Promise.all([
      base44.entities.Moderation.filter({ roblox_username: username }, { sort: '-created_date', limit: 25 }),
      base44.entities.Appeal.filter({ roblox_username: username }, { sort: '-created_date', limit: 20 }),
      base44.entities.ApplicationResponse.filter({ roblox_username: username }, { sort: '-created_date', limit: 20 }),
    ])
      .then(([modsPage, appealsPage, appsPage]) => {
        if (!active) return;
        const mods = modsPage?.items || [];
        const appeals = appealsPage?.items || [];
        const otherApps = (appsPage?.items || []).filter((r) => r.id !== currentResponseId);
        setData({
          mods,
          activeMods: mods.filter((m) => m.status === 'Active'),
          appeals,
          otherApps,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username, currentResponseId]);

  if (!username) return null;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applicant Background</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-900/80 border border-white/5 p-2">
              <div className={`text-base font-bold ${data.activeMods.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.mods.length}
              </div>
              <div className="text-[10px] text-slate-500">Moderations</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-white/5 p-2">
              <div className="text-base font-bold text-white">{data.appeals.length}</div>
              <div className="text-[10px] text-slate-500">Appeals</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-white/5 p-2">
              <div className="text-base font-bold text-cyan-300">{data.otherApps.length}</div>
              <div className="text-[10px] text-slate-500">Past Apps</div>
            </div>
          </div>

          {data.activeMods.length > 0 ? (
            <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-200">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{data.activeMods.length} active punishment(s):</span>{' '}
                {data.activeMods.slice(0, 2).map((m) => `${m.moderation_type} (${m.reason})`).join(', ')}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              Clean active standing
            </div>
          )}

          {data.otherApps.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <History className="h-3 w-3" /> Previous submissions
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {data.otherApps.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs bg-slate-900/60 rounded-md px-2 py-1">
                    <span className="text-slate-300 truncate">{a.application_title || 'Application'}</span>
                    <span className={`text-[10px] uppercase font-semibold ml-2 shrink-0 ${
                      a.status === 'accepted' ? 'text-emerald-400' : a.status === 'rejected' ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}