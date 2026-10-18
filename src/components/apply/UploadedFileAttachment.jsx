import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Eye, Download, Loader2, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic', 'svg'];
const TEXT_EXTS = ['txt', 'md', 'log', 'csv', 'json'];

export function parseFileAnswer(value) {
  if (!value || typeof value !== 'string' || !value.startsWith('file:')) return null;
  const raw = value.slice(5);
  const parts = raw.split('|');
  const fileUri = parts[0] || '';
  const filename = parts[1] || 'Uploaded file';
  const inlineBase64 = parts[2] || '';
  const ext = (filename.split('.').pop() || '').toLowerCase();
  let inlineText = '';
  if (inlineBase64) {
    try {
      const bytes = Uint8Array.from(atob(inlineBase64), (c) => c.charCodeAt(0));
      inlineText = new TextDecoder().decode(bytes);
    } catch {
      inlineText = '';
    }
  }
  return {
    fileUri,
    filename,
    ext,
    isImage: IMAGE_EXTS.includes(ext),
    isText: TEXT_EXTS.includes(ext),
    inlineText,
  };
}

export default function UploadedFileAttachment({ value, compact = false }) {
  const parsed = parseFileAnswer(value);
  const [signedUrl, setSignedUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [textContent, setTextContent] = useState(parsed?.inlineText || '');
  const [loadingText, setLoadingText] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSignedUrl('');
    setTextContent(parsed?.inlineText || '');
  }, [value]);

  // Preload signed URL for images so screenshots show a live thumbnail immediately
  useEffect(() => {
    if (!parsed?.fileUri || !parsed.isImage) return;
    let cancelled = false;
    setLoadingUrl(true);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: parsed.fileUri, expires_in: 3600 })
      .then((res) => {
        if (!cancelled && res?.signed_url) setSignedUrl(res.signed_url);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingUrl(false);
      });
    return () => { cancelled = true; };
  }, [parsed?.fileUri, parsed?.isImage]);

  if (!parsed) return null;

  const ensureSignedUrl = async () => {
    if (signedUrl) return signedUrl;
    setLoadingUrl(true);
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: parsed.fileUri, expires_in: 3600 });
      if (res?.signed_url) {
        setSignedUrl(res.signed_url);
        return res.signed_url;
      }
    } catch {} finally {
      setLoadingUrl(false);
    }
    return '';
  };

  const handleOpenViewer = async (e) => {
    e?.stopPropagation?.();
    setViewerOpen(true);
    const url = await ensureSignedUrl();
    if (parsed.isText && !textContent && url) {
      setLoadingText(true);
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const txt = await resp.text();
          setTextContent(txt);
        }
      } catch {
        // Fallback handled in viewer
      } finally {
        setLoadingText(false);
      }
    }
  };

  const handleDownload = async (e) => {
    e?.stopPropagation?.();
    const url = await ensureSignedUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyText = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
        {parsed.isImage && signedUrl && !compact && (
          <button
            type="button"
            onClick={handleOpenViewer}
            className="group relative block overflow-hidden rounded-xl border border-white/10 bg-slate-950 max-w-sm hover:border-cyan-500/40 transition-colors"
          >
            <img src={signedUrl} alt={parsed.filename} className="max-h-56 w-auto object-contain" />
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white gap-1.5">
              <Eye className="h-4 w-4" /> Click to view full screenshot
            </span>
          </button>
        )}

        <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-2 text-xs">
          {parsed.isImage ? (
            <ImageIcon className="h-4 w-4 text-cyan-300 shrink-0" />
          ) : (
            <FileText className="h-4 w-4 text-cyan-300 shrink-0" />
          )}
          <span className="font-medium text-white truncate max-w-[220px]">{parsed.filename}</span>

          {(parsed.isText || parsed.isImage) && (
            <button
              type="button"
              onClick={handleOpenViewer}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 px-2.5 py-1 text-[11px] font-medium text-cyan-200 transition-colors"
            >
              {loadingUrl ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
              {parsed.isText ? 'Read .txt' : 'View screenshot'}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            <Download className="h-3 w-3" /> Open
          </button>
        </div>
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-white pr-8">
              {parsed.isImage ? <ImageIcon className="h-4 w-4 text-cyan-400 shrink-0" /> : <FileText className="h-4 w-4 text-cyan-400 shrink-0" />}
              <span className="truncate">{parsed.filename}</span>
            </DialogTitle>
          </DialogHeader>

          {parsed.isImage ? (
            <div className="mt-2 flex flex-col items-center gap-3">
              {signedUrl ? (
                <img src={signedUrl} alt={parsed.filename} className="max-h-[65vh] w-auto rounded-xl border border-white/10 object-contain" />
              ) : (
                <div className="py-12 flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> Loading screenshot…
                </div>
              )}
              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:underline"
                >
                  <Download className="h-3.5 w-3.5" /> Open original in new tab
                </a>
              )}
            </div>
          ) : parsed.isText ? (
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  {textContent ? `${textContent.split(/\s+/).filter(Boolean).length} words · ${textContent.length} chars` : 'Text file contents'}
                </span>
                <div className="flex items-center gap-2">
                  {textContent && (
                    <button
                      type="button"
                      onClick={copyText}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy text'}
                    </button>
                  )}
                  {signedUrl && (
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2.5 py-1 text-xs text-cyan-200"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>

              {loadingText ? (
                <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> Reading text file…
                </div>
              ) : textContent ? (
                <pre className="rounded-xl bg-slate-900/90 border border-white/10 p-4 text-xs sm:text-sm text-slate-100 font-mono whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto leading-relaxed">
                  {textContent}
                </pre>
              ) : signedUrl ? (
                <iframe
                  src={signedUrl}
                  title={parsed.filename}
                  className="w-full h-[55vh] rounded-xl border border-white/10 bg-white"
                />
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">Could not load text preview.</div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}