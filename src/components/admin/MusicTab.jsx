import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Music, Clock, Play, Loader2, AlertCircle, Pause } from 'lucide-react';

const formatDuration = (ms) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatPlayedAt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

function TrackRow({ track, onPlay, isActive }) {
  return (
    <button
      onClick={() => onPlay(track)}
      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
        isActive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      {track.albumArt ? (
        <img src={track.albumArt} alt="" className="h-11 w-11 rounded-md object-cover shrink-0" />
      ) : (
        <div className="h-11 w-11 rounded-md bg-white/5 flex items-center justify-center shrink-0">
          <Music className="h-4 w-4 text-slate-500" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white truncate flex items-center gap-1.5">
          {track.name}
          {track.explicit && <span className="text-[9px] font-bold bg-rose-500/20 text-rose-400 px-1 rounded">E</span>}
        </div>
        <div className="text-xs text-slate-400 truncate">{track.artist}</div>
      </div>
      {track.playedAt && (
        <span className="text-[10px] text-slate-500 shrink-0">{formatPlayedAt(track.playedAt)}</span>
      )}
      {track.duration && (
        <span className="text-xs text-slate-500 shrink-0 tabular-nums">{formatDuration(track.duration)}</span>
      )}
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        isActive ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400'
      }`}>
        <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
      </div>
    </button>
  );
}

export default function MusicTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [error, setError] = useState('');
  const searchTimer = useRef(null);

  // Load recently played on mount
  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const res = await base44.functions.invoke('spotifyMusic', { action: 'recent' });
      const data = res.data || res;
      if (data.error) {
        setError(data.error);
      } else {
        setRecentTracks(data.tracks || []);
        setError('');
      }
    } catch (e) {
      setError(e.message || 'Failed to load recently played');
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setLoadingSearch(true);
      setError('');
      try {
        const res = await base44.functions.invoke('spotifyMusic', { action: 'search', query: value });
        const data = res.data || res;
        if (data.error) {
          setError(data.error);
          setSearchResults([]);
        } else {
          setSearchResults(data.tracks || []);
        }
      } catch (e) {
        setError(e.message || 'Search failed');
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
  }, []);

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      setCurrentTrack(null);
    } else {
      setCurrentTrack(track);
    }
  };

  const showingSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Music className="h-5 w-5 text-emerald-400" /> Music
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Search and play music while you moderate.</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a song, artist, or album..."
          className="w-full h-11 rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/60 transition-colors"
        />
        {loadingSearch && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/5 border border-rose-500/15 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Track list */}
      {showingSearch ? (
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </div>
          {searchResults.length === 0 && !loadingSearch ? (
            <p className="text-sm text-slate-500 py-8 text-center">No results found.</p>
          ) : (
            <div className="space-y-1">
              {searchResults.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  onPlay={playTrack}
                  isActive={currentTrack?.id === track.id}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Recently Played
            </span>
            <button onClick={loadRecent} className="text-xs text-slate-400 hover:text-white transition-colors">
              Refresh
            </button>
          </div>
          {loadingRecent ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
            </div>
          ) : recentTracks.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No recently played tracks. Add the SPOTIFY_REFRESH_TOKEN secret to sync your listening history.
            </p>
          ) : (
            <div className="space-y-1">
              {recentTracks.map((track, i) => (
                <TrackRow
                  key={`${track.id}-${i}`}
                  track={track}
                  onPlay={playTrack}
                  isActive={currentTrack?.id === track.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky preview player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            {currentTrack.albumArt && (
              <img src={currentTrack.albumArt} alt="" className="h-10 w-10 rounded-md object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">{currentTrack.name}</div>
              <div className="text-xs text-slate-400 truncate">{currentTrack.artist}</div>
            </div>
            <button
              onClick={() => playTrack(currentTrack)}
              className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-400 transition-colors"
            >
              <Pause className="h-4 w-4" fill="currentColor" />
            </button>
            <button
              onClick={() => setCurrentTrack(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors px-2"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 max-w-5xl mx-auto">
            {currentTrack.previewUrl ? (
              <audio src={currentTrack.previewUrl} controls autoPlay className="w-full h-10" />
            ) : (
              <p className="text-xs text-slate-500 text-center">No preview available for this track.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}