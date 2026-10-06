import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Music, Play, Pause, Loader2, AlertCircle, Zap, X } from 'lucide-react';

const formatDuration = (ms) => {
  if (!ms) return '';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const GENRES = ['Pop', 'Rock', 'Hip Hop', 'EDM', 'R&B', 'Lo-fi', 'Indie', 'Jazz'];

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
        <div className="text-sm font-medium text-white truncate">{track.name}</div>
        <div className="text-xs text-slate-400 truncate">{track.artist}</div>
      </div>
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
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');
  const [bassBoost, setBassBoost] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const searchTimer = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const bassFilterRef = useRef(null);
  const ytPlayerRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT?.Player) return;
    if (document.getElementById('yt-iframe-api')) return;
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // Create/update YouTube player when videoId changes
  useEffect(() => {
    if (!videoId || bassBoost) return;
    const initPlayer = () => {
      if (!window.YT?.Player) return;
      if (ytPlayerRef.current) {
        ytPlayerRef.current.loadVideoById(videoId);
      } else {
        const el = document.getElementById('yt-music-player');
        if (!el) return;
        ytPlayerRef.current = new window.YT.Player('yt-music-player', {
          videoId,
          playerVars: { autoplay: 1, controls: 0, modestbranding: 1 },
          events: {
            onStateChange: (e) => setIsPlaying(e.data === 1),
          },
        });
      }
    };
    if (window.YT?.Player) initPlayer();
    else {
      const check = setInterval(() => {
        if (window.YT?.Player) { clearInterval(check); initPlayer(); }
      }, 200);
      return () => clearInterval(check);
    }
  }, [videoId, bassBoost]);

  // Update bass filter gain
  useEffect(() => {
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = bassBoost ? 15 : 0;
    }
  }, [bassBoost]);

  // Media Session API — shows on iPhone Dynamic Island + lock screen
  const setupMediaSession = useCallback((track) => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.artist,
        album: track.album,
        artwork: track.albumArt ? [{ src: track.albumArt, sizes: '300x300', type: 'image/jpeg' }] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        if (ytPlayerRef.current && !bassBoost) ytPlayerRef.current.playVideo();
        if (audioRef.current && bassBoost) { audioCtxRef.current?.resume(); audioRef.current.play(); }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        if (ytPlayerRef.current && !bassBoost) ytPlayerRef.current.pauseVideo();
        if (audioRef.current && bassBoost) audioRef.current.pause();
      });
    } catch {}
  }, [bassBoost]);

  // Web Audio API bass boost
  const setupAudioGraph = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
      bassFilterRef.current = audioCtxRef.current.createBiquadFilter();
      bassFilterRef.current.type = 'lowshelf';
      bassFilterRef.current.frequency.value = 200;
      bassFilterRef.current.gain.value = bassBoost ? 15 : 0;
      source.connect(bassFilterRef.current);
      bassFilterRef.current.connect(audioCtxRef.current.destination);
    } catch {}
  }, [bassBoost]);

  // Start playback
  const startPlayback = useCallback(async (track, useBass) => {
    setVideoId(null);
    setIsPlaying(true);
    setError('');
    setupMediaSession(track);

    if (useBass) {
      if (track.previewUrl) {
        setupAudioGraph();
        if (audioRef.current) {
          audioRef.current.src = track.previewUrl;
          audioCtxRef.current?.resume();
          audioRef.current.play();
        }
      } else {
        setError('No preview available. Turn off Bass Boost for full playback.');
      }
    } else {
      setLoadingVideo(true);
      try {
        const res = await base44.functions.invoke('spotifyMusic', {
          action: 'play',
          name: track.name,
          artist: track.artist,
        });
        const data = res.data || res;
        if (data.videoId) {
          setVideoId(data.videoId);
        } else if (track.previewUrl) {
          setError('Full song unavailable, playing 30-second preview.');
          setupAudioGraph();
          if (audioRef.current) {
            audioRef.current.src = track.previewUrl;
            audioCtxRef.current?.resume();
            audioRef.current.play();
          }
        } else {
          setError(data.error || 'Could not load track');
        }
      } catch (e) {
        setError(e.message || 'Failed to load track');
      } finally {
        setLoadingVideo(false);
      }
    }
  }, [setupMediaSession, setupAudioGraph]);

  const playTrack = useCallback((track) => {
    if (currentTrack?.id === track.id) {
      setCurrentTrack(null);
      if (ytPlayerRef.current) { try { ytPlayerRef.current.stopVideo(); } catch {} }
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    setCurrentTrack(track);
    startPlayback(track, bassBoost);
  }, [currentTrack, bassBoost, startPlayback]);

  const toggleBassBoost = () => {
    const newValue = !bassBoost;
    setBassBoost(newValue);
    if (currentTrack) {
      if (ytPlayerRef.current) { try { ytPlayerRef.current.stopVideo(); } catch {} }
      if (audioRef.current) audioRef.current.pause();
      startPlayback(currentTrack, newValue);
    }
  };

  const togglePlayPause = () => {
    if (bassBoost && audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioCtxRef.current?.resume(); audioRef.current.play(); setIsPlaying(true); }
    } else if (ytPlayerRef.current) {
      if (isPlaying) { try { ytPlayerRef.current.pauseVideo(); } catch {} setIsPlaying(false); }
      else { try { ytPlayerRef.current.playVideo(); } catch {} setIsPlaying(true); }
    }
  };

  const closePlayer = () => {
    if (ytPlayerRef.current) { try { ytPlayerRef.current.stopVideo(); } catch {} }
    if (audioRef.current) audioRef.current.pause();
    setCurrentTrack(null);
  };

  // Debounced search
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setLoadingSearch(true);
      setError('');
      try {
        const res = await base44.functions.invoke('spotifyMusic', { action: 'search', query: value });
        const data = res.data || res;
        if (data.error) { setError(data.error); setSearchResults([]); }
        else { setSearchResults(data.tracks || []); }
      } catch (e) {
        setError(e.message || 'Search failed');
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
  }, []);

  const showingSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4 pb-28">
      <div>
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Music className="h-5 w-5 text-emerald-400" /> Music
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Search and play music while you moderate.</p>
      </div>

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

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/5 border border-rose-500/15 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {showingSearch ? (
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </div>
          {searchResults.length === 0 && !loadingSearch ? (
            <p className="text-sm text-slate-500 py-8 text-center">No results found.</p>
          ) : (
            <div className="space-y-1">
              {searchResults.map((track, i) => (
                <TrackRow key={`${track.id}-${i}`} track={track} onPlay={playTrack} isActive={currentTrack?.id === track.id} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Browse</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleSearch(genre)}
                className="p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors text-sm text-slate-300 text-left"
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden YouTube player container */}
      <div className="hidden">
        <div id="yt-music-player" />
      </div>

      {/* Hidden audio element for preview/bass boost */}
      <audio ref={audioRef} className="hidden" />

      {/* Sticky player */}
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
            {loadingVideo && <Loader2 className="h-4 w-4 text-slate-400 animate-spin shrink-0" />}
            <button
              onClick={toggleBassBoost}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                bassBoost ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title="Bass Boost (uses 30s preview)"
            >
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
              Bass
            </button>
            <button
              onClick={togglePlayPause}
              className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-400 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={closePlayer} className="text-slate-400 hover:text-white transition-colors px-2">
              <X className="h-4 w-4" />
            </button>
          </div>
          {bassBoost && (
            <p className="mt-1 max-w-5xl mx-auto text-[10px] text-amber-400/70 text-center">
              Bass Boost uses 30-second previews
            </p>
          )}
        </div>
      )}
    </div>
  );
}