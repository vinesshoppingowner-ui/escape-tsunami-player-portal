import { useState, useRef } from 'react';
import { Upload, X, Loader2, ClipboardPaste } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import UploadedFileAttachment from '@/components/apply/UploadedFileAttachment';

const ALWAYS_ALLOWED_SCREENSHOT_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic'];
const TEXT_EXTS = ['txt', 'md', 'log'];

export default function FileUploadField({ q, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const baseAllowed = (q.fileTypes && q.fileTypes.length ? q.fileTypes : ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'txt'])
    .map((t) => t.toLowerCase().replace(/^\./, ''));
  // Always ensure screenshots (png/jpg/jpeg/webp/gif) and .txt are accepted
  const allowedTypes = Array.from(new Set([...baseAllowed, ...ALWAYS_ALLOWED_SCREENSHOT_EXTS, 'txt']));
  const maxBytes = (q.maxFileSize || 10) * 1024 * 1024;
  const accepted = [...allowedTypes.map((t) => `.${t}`), 'image/*', 'text/plain'].join(',');

  const handleFile = async (rawFile) => {
    setError('');
    if (!rawFile) return;

    let file = rawFile;
    let ext = (file.name?.split('.').pop() || '').toLowerCase();
    const isImageMime = file.type && file.type.startsWith('image/');
    const isTextMime = file.type === 'text/plain';

    // Handle clipboard screenshots that may not have an extension
    if (isImageMime && (!ext || !allowedTypes.includes(ext))) {
      const guessedExt = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
      ext = guessedExt;
      file = new File([file], `screenshot-${Date.now()}.${guessedExt}`, { type: file.type });
    }

    if (!allowedTypes.includes(ext) && !isImageMime && !isTextMime) {
      setError(`Only ${allowedTypes.join(', ')} files or screenshots are allowed.`);
      return;
    }
    if (file.size > maxBytes) {
      setError(`File is too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }

    setUploading(true);
    try {
      let encodedText = '';
      if (TEXT_EXTS.includes(ext) || isTextMime) {
        try {
          const text = await file.text();
          const slice = text.slice(0, 12000);
          const bytes = new TextEncoder().encode(slice);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          encodedText = btoa(binary);
        } catch {}
      }
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      onChange(encodedText ? `file:${result.file_uri}|${file.name}|${encodedText}` : `file:${result.file_uri}|${file.name}`);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) {
          e.preventDefault();
          handleFile(f);
          return;
        }
      }
    }
  };

  if (value && typeof value === 'string' && value.startsWith('file:')) {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <UploadedFileAttachment value={value} />
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remove file"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onPaste={handlePaste}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer?.files?.[0]);
        }}
        disabled={uploading}
        className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors disabled:opacity-50 ${
          dragging
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-white/15 bg-white/[0.03] hover:border-cyan-500/40 hover:bg-cyan-500/5'
        }`}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        ) : (
          <Upload className="h-8 w-8 text-slate-400" />
        )}
        <span className="text-sm text-slate-200 font-medium">
          {uploading ? 'Uploading…' : 'Click to upload, drag & drop, or paste a screenshot (Ctrl+V)'}
        </span>
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <ClipboardPaste className="h-3.5 w-3.5 text-cyan-400" />
          Screenshots (PNG, JPG, WEBP, GIF), TXT, PDF, DOCX · max {(maxBytes / 1024 / 1024).toFixed(0)}MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}