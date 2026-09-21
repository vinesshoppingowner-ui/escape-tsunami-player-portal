import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, MessageCircle, Check, LogIn } from 'lucide-react';

const CONNECTOR_ID = '6ab0794c356399d5281b0bdf';

export default function DiscordConnect({ streak, onLinked }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (streak?.discord_id) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-300">
        <Check className="h-4 w-4" /> Discord linked
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
      >
        <LogIn className="h-4 w-4" /> Sign in to connect
      </Link>
    );
  }

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          (async () => {
            try {
              const res = await base44.functions.invoke('getDiscordProfile', {});
              if (res.data?.discord_id) {
                if (streak) {
                  await base44.entities.UserStreak.update(streak.id, {
                    discord_id: res.data.discord_id,
                  });
                }
                onLinked?.(res.data.discord_id);
              } else {
                setError('Could not get Discord profile. Please try again.');
              }
            } catch {
              setError('Failed to link Discord. Please try again.');
            } finally {
              setLoading(false);
            }
          })();
        }
      }, 500);
    } catch (e) {
      setError(e.message || 'Failed to connect');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
        Connect Discord
      </button>
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </div>
  );
}