import { useState } from 'react';
import { Video, Play, ExternalLink, X } from 'lucide-react';

const YOUTUBE_EMBED = (id) => `https://www.youtube.com/embed/${id}`;
const MEDAL_EMBED = (url) => `https://medal.tv/embed/${url.match(/clip\/([^/?#]+)/)?.[1] || ''}`;

function parseVideo(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    // YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = u.searchParams.get('v');
      if (videoId) return { type: 'youtube', embed: YOUTUBE_EMBED(videoId), original: url };
    }
    if (host === 'youtu.be') {
      const videoId = u.pathname.slice(1);
      if (videoId) return { type: 'youtube', embed: YOUTUBE_EMBED(videoId), original: url };
    }

    // Medal.tv
    if (host === 'medal.tv') {
      const clipId = u.pathname.match(/clip\/([^/?#]+)/)?.[1];
      if (clipId) return { type: 'medal', embed: MEDAL_EMBED(url), original: url };
    }

    // Streamable
    if (host === 'streamable.com') {
      const clipId = u.pathname.slice(1);
      if (clipId) return { type: 'streamable', embed: `https://streamable.com/e/${clipId}`, original: url };
    }

    // Twitch clips
    if (host === 'clips.twitch.tv' || host === 'twitch.tv') {
      return { type: 'twitch', embed: null, original: url };
    }

    // Generic — just show a link
    return { type: 'link', embed: null, original: url };
  } catch {
    return null;
  }
}

export function isValidVideoUrl(url) {
  if (!url) return false;
  return !!parseVideo(url);
}

export default function VideoAttachment({ url }) {
  const [expanded, setExpanded] = useState(false);
  const video = parseVideo(url);

  if (!video) return null;

  return (
    <div className="mt-2 w-full max-w-sm">
      {video.embed && expanded ? (
        <div className="relative rounded-lg overflow-hidden border border-white/15 bg-black">
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            aria-label="Collapse video"
          >
            <X className="h-4 w-4" />
          </button>
          <iframe
            src={video.embed}
            className="w-full aspect-video"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title="Video attachment"
          />
        </div>
      ) : (
        <a
          href={video.original}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { if (video.embed) { e.preventDefault(); setExpanded(true); } }}
          className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-2.5 transition-colors group"
        >
          <div className="h-8 w-8 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
            {video.embed ? <Play className="h-4 w-4 text-rose-300" /> : <Video className="h-4 w-4 text-rose-300" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-200 truncate">
              {video.type === 'youtube' ? 'YouTube video' :
               video.type === 'medal' ? 'Medal.tv clip' :
               video.type === 'streamable' ? 'Streamable clip' :
               video.type === 'twitch' ? 'Twitch clip' : 'Video link'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{video.original}</div>
          </div>
          {video.embed && (
            <span className="text-[10px] text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">Play</span>
          )}
          <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        </a>
      )}
    </div>
  );
}