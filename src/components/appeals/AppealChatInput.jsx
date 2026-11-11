import { useRef, useState, useEffect } from 'react';
import { Loader2, Send, Camera, X, Zap, Lock, Video, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CHAT_QUICK_REPLIES } from '@/lib/chatQuickReplies';
import { isValidVideoUrl } from '@/components/appeals/VideoAttachment';

const ALLOWED_SCREENSHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_SCREENSHOT_EXT = /\.(png|jpe?g|webp)$/i;
const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024; // 10 MB

export default function AppealChatInput({ isStaff, onSend, onTyping }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileError, setFileError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const validateAndSelectScreenshot = (candidate) => {
    setFileError('');
    if (!candidate) return;
    const validMime = ALLOWED_SCREENSHOT_TYPES.includes(candidate.type);
    const validExt = ALLOWED_SCREENSHOT_EXT.test(candidate.name || '') || candidate.type.startsWith('image/');
    if (!validMime || !validExt) {
      setFileError('Screenshots only (PNG, JPG, or WEBP) — custom files are not allowed.');
      return;
    }
    if (candidate.size > MAX_SCREENSHOT_BYTES) {
      setFileError('Screenshot must be under 10 MB.');
      return;
    }
    setFile(candidate);
  };

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find((item) => item.kind === 'file' && ALLOWED_SCREENSHOT_TYPES.includes(item.type));
    if (imgItem) {
      e.preventDefault();
      const blob = imgItem.getAsFile();
      if (blob) {
        const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
        const namedFile = new File([blob], `screenshot-${Date.now()}.${ext}`, { type: blob.type });
        validateAndSelectScreenshot(namedFile);
      }
    }
  };

  const hasVideo = Boolean(videoUrl.trim() && isValidVideoUrl(videoUrl.trim()));

  const submit = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !file && !hasVideo) || sending) return;
    setSending(true);
    setFileError('');
    try {
      await onSend(text.trim(), file, note, hasVideo ? videoUrl.trim() : undefined);
      setText('');
      setFile(null);
      setVideoUrl('');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-white/10 p-2 space-y-2">
      {fileError && (
        <div className="flex items-center justify-between gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-lg px-2.5 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            {fileError}
          </span>
          <button type="button" onClick={() => setFileError('')} className="text-rose-300/70 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {file && (
        <div className="flex items-center gap-2.5 text-xs text-slate-200 bg-white/5 border border-cyan-500/30 rounded-lg px-2.5 py-1.5">
          {previewUrl ? (
            <img src={previewUrl} alt="Screenshot preview" className="h-9 w-12 rounded object-cover border border-white/10 shrink-0" />
          ) : (
            <Camera className="h-4 w-4 text-cyan-400 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-cyan-200 truncate">{file.name}</div>
            <div className="text-[10px] text-slate-400">Screenshot ready to send ({Math.max(1, Math.round(file.size / 1024))} KB)</div>
          </div>
          <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-white p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {videoUrl.trim() && (
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5">
          <Video className="h-3.5 w-3.5 text-rose-400" /> <span className="truncate flex-1">{videoUrl}</span>
          <button type="button" onClick={() => setVideoUrl('')} className="text-slate-400 hover:text-white"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            validateAndSelectScreenshot(e.target.files?.[0] || null);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Upload screenshot (PNG, JPG, WEBP — or paste with Ctrl+V)"
          className="h-9 px-2.5 shrink-0 rounded-full border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 inline-flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <Camera className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Screenshot</span>
        </button>
        <button type="button" onClick={() => { const url = prompt('Paste a video link (YouTube, Medal.tv, Streamable):'); if (url) setVideoUrl(url); }} title="Attach video link" className={`h-9 w-9 shrink-0 rounded-full border flex items-center justify-center ${hasVideo ? 'border-rose-500/50 bg-rose-500/15 text-rose-300' : 'border-white/15 text-slate-300 hover:text-white hover:bg-white/10'}`}>
          <Video className="h-4 w-4" />
        </button>
        {isStaff && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" title="Quick replies" className="h-9 w-9 shrink-0 rounded-full border border-violet-500/30 text-violet-300 hover:bg-violet-500/15 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-slate-900 border-white/15 text-white w-72">
              {CHAT_QUICK_REPLIES.map((r) => (
                <DropdownMenuItem key={r.label} onClick={() => setText(r.text)} className="flex flex-col items-start focus:bg-white/10 focus:text-white cursor-pointer">
                  <span className="text-xs font-semibold text-violet-300">{r.label}</span>
                  <span className="text-xs text-slate-400 line-clamp-2">{r.text}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {isStaff && (
          <button type="button" onClick={() => setNote(!note)} title="Staff-only note (player can't see)"
            className={`h-9 w-9 shrink-0 rounded-full border flex items-center justify-center ${note ? 'border-amber-500/50 bg-amber-500/20 text-amber-300' : 'border-white/15 text-slate-300 hover:bg-white/10'}`}>
            <Lock className="h-4 w-4" />
          </button>
        )}
        <input
          value={text}
          onPaste={handlePaste}
          onChange={(e) => { setText(e.target.value); if (!note) onTyping(); }}
          placeholder={note ? 'Staff-only note — player can’t see this…' : 'Type a message or paste a screenshot (Ctrl+V)…'}
          maxLength={1000}
          className="flex-1 min-w-0 bg-slate-950/60 border border-white/15 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button type="submit" disabled={(!text.trim() && !file && !hasVideo) || sending} className="h-9 w-9 shrink-0 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 flex items-center justify-center hover:bg-cyan-500/30 disabled:opacity-40">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}