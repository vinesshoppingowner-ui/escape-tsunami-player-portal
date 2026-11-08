import { useEffect, useState } from 'react';
import { Loader2, ImageOff, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SignedEvidenceImage({ uri }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setError(false);

    if (!uri) {
      setUrl(null);
      setError(true);
      return;
    }

    // Direct public URL or data URI — render directly without signing
    if (
      uri.startsWith('http://') ||
      uri.startsWith('https://') ||
      uri.startsWith('data:') ||
      uri.startsWith('blob:')
    ) {
      setUrl(uri);
      return;
    }

    setUrl(null);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 600 })
      .then((r) => {
        if (!active) return;
        if (r?.signed_url) {
          setUrl(r.signed_url);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [uri]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-900/60 text-slate-400">
        <ImageOff className="h-6 w-6 text-rose-400/80" />
        <p className="text-xs font-medium text-slate-300">
          Evidence image could not be loaded
        </p>
        <p className="text-[11px] text-slate-500 max-w-sm">
          This file was uploaded to external staff private storage. Staff should re-upload using public image links so players can view it across portals.
        </p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={url}
        alt="Evidence"
        className="w-full max-h-[26rem] object-contain bg-slate-950"
        onError={() => setError(true)}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/15 text-[11px] text-slate-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Open full size <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}