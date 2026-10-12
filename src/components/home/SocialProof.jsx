const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
};

export default function SocialProof({ stats, loading, error }) {
  const visits = !loading && !error ? stats?.visits : null;
  const playing = !loading && !error ? stats?.playing : null;

  return (
    <div className="text-center py-6">
      <p className="text-base sm:text-lg text-slate-300">
        {visits != null ? (
          <>Join <span className="font-bold text-white">{fmtNum(visits)}+</span> players who have survived the wave</>
        ) : (
          <>Join the community</>
        )}
      </p>
      {playing != null && playing > 0 && (
        <p className="text-xs text-cyan-400 mt-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
          {fmtNum(playing)} playing right now
        </p>
      )}
    </div>
  );
}