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
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#07090e]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Scan your access badge</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {starting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          )}

          {!error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56 max-w-[70%]">
                <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-cyan-400" />
                <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-cyan-400" />
                <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-cyan-400" />
                <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-cyan-400" />
                <span className="absolute inset-x-3 top-1/2 h-px animate-pulse bg-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
              <p className="text-xs leading-relaxed text-slate-300">{error}</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Hold the badge steady — you'll be signed in automatically.
        </p>
      </div>
    </div>
  );
}