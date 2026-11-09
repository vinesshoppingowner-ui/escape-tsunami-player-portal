import { useState, useRef } from 'react';
import { Upload, X, Loader2, ClipboardPaste, ImagePlus, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import UploadedFileAttachment, { splitFileAnswers } from '@/components/apply/UploadedFileAttachment';
import NewBadge from '@/components/ui/new-badge';

const ALWAYS_ALLOWED_SCREENSHOT_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic', 'svg', 'avif'];
const TEXT_EXTS = ['txt', 'md', 'log', 'csv', 'json'];

export default function FileUploadField({ q, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const isScreenshotMode = q.type === 'screenshot';
  const allowMultiple = isScreenshotMode || q.allowMultipleFiles !== false;

  const baseAllowed = (
    q.fileTypes && q.fileTypes.length
      ? q.fileTypes
      : ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'zip']
  ).map((t) => t.toLowerCase().replace(/^\./, ''));

  const allowedTypes = Array.from(new Set([...baseAllowed, ...ALWAYS_ALLOWED_SCREENSHOT_EXTS, 'txt', 'pdf']));
  // Screenshots have NO size cap ("any screenshot size"). Non-image files only enforce maxFileSize if explicitly set > 0 and not in screenshot mode.
  const customMaxMb = Number(q.maxFileSize) || 0;
  const accepted = [...allowedTypes.map((t) => `.${t}`), 'image/*', 'text/plain'].join(',');

  const existingFiles = splitFileAnswers(value);

  const handleFiles = async (fileList) => {
    setError('');
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;

    setUploading(true);
    const uploadedEntries = [];
    try {
      for (const rawFile of files) {
        let file = rawFile;
        let ext = (file.name?.split('.').pop() || '').toLowerCase();
        const isImageMime = Boolean(file.type && file.type.startsWith('image/')) || ALWAYS_ALLOWED_SCREENSHOT_EXTS.includes(ext);
        const isTextMime = file.type === 'text/plain' || TEXT_EXTS.includes(ext);

        // Handle clipboard screenshots that may not have an extension
        if (isImageMime && (!ext || !allowedTypes.includes(ext))) {
          const guessedExt = (file.type?.split('/')[1] || 'png').replace('jpeg', 'jpg');
          ext = guessedExt;
          file = new File([file], `screenshot-${Date.now()}.${guessedExt}`, { type: file.type || 'image/png' });
        }

        if (!isScreenshotMode && !allowedTypes.includes(ext) && !isImageMime && !isTextMime) {
          setError(`Unsupported file type (.${ext || 'unknown'}). Allowed: screenshots, images, or ${allowedTypes.join(', ')}.`);
          continue;
        }

        // Screenshots & screenshot mode allow ANY screenshot size; only apply limit to non-screenshots when maxFileSize > 0
        if (!isImageMime && !isScreenshotMode && customMaxMb > 0 && file.size > customMaxMb * 1024 * 1024) {
          setError(`${file.name} exceeds the ${customMaxMb}MB limit for non-image files.`);
          continue;
        }

        let encodedText = '';
        if (isTextMime) {
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
        const entry = encodedText
          ? `file:${result.file_uri}|${file.name}|${encodedText}`
          : `file:${result.file_uri}|${file.name}`;
        uploadedEntries.push(entry);
      }

      if (uploadedEntries.length > 0) {
        const nextList = allowMultiple ? [...existingFiles, ...uploadedEntries] : [uploadedEntries[0]];
        onChange(nextList.join('\n'));
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const pastedFiles = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) pastedFiles.push(f);
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      handleFiles(pastedFiles);
    }
  };

  const removeSingleFile = (idxToRemove) => {
    const next = existingFiles.filter((_, idx) => idx !== idxToRemove);
    onChange(next.join('\n'));
  };

  return (
    <div onPaste={handlePaste} className="space-y-3">
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((item, idx) => (
            <div key={`${item}-${idx}`} className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 flex items-start justify-between gap-3">
              <UploadedFileAttachment value={item} />
              <button
                type="button"
                onClick={() => removeSingleFile(idx)}
                title="Remove file"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(existingFiles.length === 0 || allowMultiple) && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer?.files);
          }}
          disabled={uploading}
          className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 ${
            existingFiles.length > 0 ? 'py-5' : 'py-9'
          } text-center transition-colors disabled:opacity-50 ${
            dragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-white/15 bg-white/[0.03] hover:border-cyan-500/40 hover:bg-cyan-500/5'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          ) : existingFiles.length > 0 ? (
            <Plus className="h-6 w-6 text-cyan-400" />
          ) : isScreenshotMode ? (
            <ImagePlus className="h-8 w-8 text-cyan-400" />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" />
          )}
          <span className="text-sm text-slate-200 font-medium inline-flex items-center gap-2 flex-wrap justify-center">
            {uploading
              ? 'Uploading screenshot / file…'
              : existingFiles.length > 0
              ? 'Add another screenshot or file (or press Ctrl+V to paste)'
              : 'Click to upload, drag & drop, or paste any screenshot (Ctrl+V)'}
            {isScreenshotMode && existingFiles.length === 0 && <NewBadge />}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap justify-center">
            <ClipboardPaste className="h-3.5 w-3.5 text-cyan-400" />
            <span>Any screenshot resolution & file size supported (PNG, JPG, WEBP, GIF, PDF, TXT, DOCX)</span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple={allowMultiple}
        accept={accepted}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}