import { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertTriangle, ScanLine } from 'lucide-react';

const loadJsQr = () =>
  new Promise((resolve, reject) => {
    if (window.jsQR) return resolve(window.jsQR);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.async = true;
    script.onload = () => (window.jsQR ? resolve(window.jsQR) : reject(new Error('jsQR missing')));
    script.onerror = () => reject(new Error('jsQR failed to load'));
    document.head.appendChild(script);
  });

/**
 * Full-screen camera view that reads a QR code and hands back its text.
 * Uses the browser's built-in barcode detector when available, and falls back
 * to a small decoder loaded on demand.
 */
export default function QrScannerDialog({ open, onClose, onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const foundRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [starting, setStarting] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    foundRef.current = false;
    setError('');
    setStarting(true);

    const stop = () => {
      cancelAnimationFrame(rafRef.current);
      const stream = streamRef.current;
      streamRef.current = null;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };

    const buildDetector = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          if (formats.includes('qr_code')) {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            return async (video) => {
              const found = await detector.detect(video);
              return found?.[0]?.rawValue || '';
            };
          }
        } catch {
          /* fall through to the bundled decoder */
        }
      }
      const jsQR = await loadJsQr();
      return (video) => {
        const canvas = canvasRef.current;
        if (!canvas || !video.videoWidth) return '';
        const width = 480;
        const height = Math.round((video.videoHeight / video.videoWidth) * width);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, width, height);
        const frame = ctx.getImageData(0, 0, width, height);
        const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' });
        return code?.data || '';
      };
    };

    const run = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStarting(false);
        setError('This browser cannot open the camera. Scan the badge with your phone camera app instead.');
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        setStarting(false);
        setError('Camera access was blocked. Allow the camera and try again, or scan the badge with your phone camera app.');
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* autoplay already requested via attributes */
      }
      setStarting(false);

      let detect;
      try {
        detect = await buildDetector();
      } catch {
        setError('Camera scanning is unavailable in this browser. Scan the badge with your phone camera app instead.');
        return;
      }

      const tick = async () => {
        if (cancelled || foundRef.current) return;
        const el = videoRef.current;
        if (el && el.readyState >= 2) {
          try {
            const value = await detect(el);
            if (value && !foundRef.current) {
              foundRef.current = true;
              stop();
              onResultRef.current?.(value);
              return;
            }
          } catch {
            /* keep scanning through dropped frames */
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    run();

    return () => {
      cancelled = true;
      stop();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#05070c]/96 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.16),transparent_70%)]" />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-blue-600/10">
              <ScanLine className="h-4 w-4 text-cyan-300" />
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-tight text-white">Scan access badge</h2>
              <p className="text-[11px] leading-tight text-slate-500">Point at the QR on your badge</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition-colors hover:bg-white/[0.1] hover:text-white"
            aria-label="Close scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-black shadow-[0_30px_90px_-25px_rgba(34,211,238,0.45)]">
          <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05070c]/60 via-transparent to-[#05070c]/80" />

          {starting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/10" />
                <span className="qr-halo absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.35),transparent_70%)]" />
                <Loader2 className="relative h-6 w-6 animate-spin text-cyan-300" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/70">Starting camera</p>
            </div>
          )}

          {!error && !starting && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative aspect-square w-[64%] max-w-[246px]">
                <span className="qr-halo absolute -inset-14 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_70%)]" />
                <span className="absolute inset-0 rounded-[26px] ring-1 ring-cyan-300/25 shadow-[0_0_0_9999px_rgba(4,7,13,0.72)]" />
                <span className="qr-grid absolute inset-0 rounded-[26px]" />

                <span className="qr-corner absolute left-0 top-0 h-11 w-11 rounded-tl-[22px] border-l-2 border-t-2 border-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,0.95)]" />
                <span className="qr-corner absolute right-0 top-0 h-11 w-11 rounded-tr-[22px] border-r-2 border-t-2 border-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,0.95)]" style={{ animationDelay: '0.15s' }} />
                <span className="qr-corner absolute bottom-0 left-0 h-11 w-11 rounded-bl-[22px] border-b-2 border-l-2 border-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,0.95)]" style={{ animationDelay: '0.3s' }} />
                <span className="qr-corner absolute bottom-0 right-0 h-11 w-11 rounded-br-[22px] border-b-2 border-r-2 border-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,0.95)]" style={{ animationDelay: '0.45s' }} />

                <span className="qr-sweep absolute inset-x-3 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_20px_5px_rgba(34,211,238,0.5)]" />
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-7 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <p className="max-w-[16rem] text-xs leading-relaxed text-slate-300">{error}</p>
            </div>
          )}

          {!error && !starting && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/85 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Scanning
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
          Centre the badge inside the frame — you'll be signed in automatically.
        </p>
      </div>
    </div>
  );
}