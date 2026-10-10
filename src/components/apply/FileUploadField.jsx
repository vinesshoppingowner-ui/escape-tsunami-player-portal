import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FILE_ICONS = {
  pdf: FileText, doc: FileText, docx: FileText,
  png: FileText, jpg: FileText, jpeg: FileText, gif: FileText, webp: FileText,
  txt: FileText, md: FileText,
};

export default function FileUploadField({ q, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const allowedTypes = q.fileTypes || ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'];
  const maxBytes = (q.maxFileSize || 5) * 1024 * 1024; // default 5MB
  const accepted = allowedTypes.map((t) => `.${t}`).join(',');

  const handleFile = async (file) => {
    setError('');
    if (!file) return;

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setError(`Only ${allowedTypes.join(', ')} files are allowed.`);
      return;
    }
    if (file.size > maxBytes) {
      setError(`File is too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      onChange(`file:${result.file_uri}|${file.name}`);
    } catch (e) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Already uploaded
  if (value && typeof value === 'string' && value.startsWith('file:')) {
    const [, filename] = value.split('|');
    return (
      <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
        <FileText className="h-5 w-5 text-cyan-300 shrink-0" />
        <span className="flex-1 text-sm text-white truncate">{filename || 'Uploaded file'}</span>
        <button type="button" onClick={() => onChange('')} className="p-1 text-slate-400 hover:text-rose-400">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        ) : (
          <Upload className="h-8 w-8 text-slate-400" />
        )}
        <span className="text-sm text-slate-300">
          {uploading ? 'Uploading…' : 'Click to upload or drag a file'}
        </span>
        <span className="text-xs text-slate-500">
          {allowedTypes.join(', ').toUpperCase()} · max {(maxBytes / 1024 / 1024).toFixed(0)}MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}