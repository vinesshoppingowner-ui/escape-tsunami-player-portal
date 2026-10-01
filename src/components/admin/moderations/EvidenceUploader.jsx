import { useState } from 'react';
import { Loader2, Paperclip, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Lets staff attach several evidence images; stores private file URIs.
export default function EvidenceUploader({ files, onChange }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!picked.length) return;
    setUploading(true);
    const uris = await Promise.all(picked.map((file) => base44.integrations.Core.UploadPrivateFile({ file }).then((r) => r.file_uri)));
    onChange([...files, ...uris]);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
        {uploading ? 'Uploading…' : 'Attach images'}
        <input type="file" accept="image/*" multiple className="hidden" onChange={upload} disabled={uploading} />
      </label>
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((uri, i) => (
            <li key={uri} className="flex items-center justify-between rounded-md bg-slate-950/50 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
              Image {i + 1}
              <button type="button" onClick={() => onChange(files.filter((f) => f !== uri))} className="text-slate-500 hover:text-rose-300"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}