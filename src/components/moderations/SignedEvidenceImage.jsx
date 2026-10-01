import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SignedEvidenceImage({ uri }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 600 }).then((r) => setUrl(r.signed_url));
  }, [uri]);
  if (!url) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>;
  return <img src={url} alt="Evidence" className="w-full" />;
}