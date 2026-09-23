import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function ChatImage({ uri }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 }).then((r) => setUrl(r.signed_url));
  }, [uri]);

  if (!url) {
    return <div className="h-32 w-48 rounded-lg bg-white/5 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div>;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1">
      <img src={url} alt="Attachment" className="max-h-56 max-w-full rounded-lg border border-white/10 object-contain" />
    </a>
  );
}