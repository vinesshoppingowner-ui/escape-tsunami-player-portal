import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload } from 'lucide-react';

export default function IconUpload({ onUploaded }) {
  const [busy, setBusy] = useState(false);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    onUploaded(file_url);
    setBusy(false);
  };
  return (
    <label className="h-8 px-2.5 rounded-lg border border-dashed border-white/20 text-xs text-slate-300 hover:bg-white/10 inline-flex items-center gap-1.5 cursor-pointer">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload custom
      <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
    </label>
  );
}