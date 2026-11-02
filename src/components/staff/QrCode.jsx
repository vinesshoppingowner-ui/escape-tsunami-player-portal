import { useId, useMemo } from 'react';
import QRCode from 'qrcode';

/**
 * Styled, print-ready QR code: rounded modules, a gradient ink, custom finder
 * eyes and the Escape Tsunami wave mark in the middle. Rendered as SVG so it
 * stays crisp on a printed badge. High error correction keeps the centre logo
 * and the rounded shapes scannable.
 */

const QUIET = 2; // quiet zone, in modules
const PAD = 8.5; // white logo pad, in modules
const DOT_R = 0.42; // module corner radius

function buildMatrix(value) {
  if (!value) return null;
  try {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
    return { size: qr.modules.size, data: qr.modules.data };
  } catch {
    return null;
  }
}

const inEye = (row, col, s) =>
  (row < 7 && col < 7) || (row < 7 && col >= s - 7) || (row >= s - 7 && col < 7);

const inPad = (row, col, s) =>
  Math.abs(row + 0.5 - s / 2) <= PAD / 2 && Math.abs(col + 0.5 - s / 2) <= PAD / 2;

function WaveGlyph({ x, y, size, gradientId }) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

export default function QrCode({ value, size = 216, className = '', alt = '' }) {
  const rawId = useId();
  const gradientId = `qr-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const qr = useMemo(() => buildMatrix(value), [value]);

  if (!qr) {
    return <div className={`bg-white ${className}`} style={{ width: size, height: size }} aria-hidden="true" />;
  }

  const s = qr.size;
  const total = s + QUIET * 2;
  const pad = (total - PAD) / 2;

  const dots = [];
  for (let row = 0; row < s; row += 1) {
    for (let col = 0; col < s; col += 1) {
      if (!qr.data[row * s + col]) continue;
      if (inEye(row, col, s) || inPad(row, col, s)) continue;
      dots.push(
        <rect key={`${row}-${col}`} x={col + QUIET} y={row + QUIET} width={1} height={1} rx={DOT_R} />,
      );
    }
  }

  const eyes = [
    [QUIET, QUIET],
    [QUIET + s - 7, QUIET],
    [QUIET, QUIET + s - 7],
  ];

  return (
    <svg
      role="img"
      aria-label={alt || `QR code for ${value}`}
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      className={className}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="55%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <g fill={`url(#${gradientId})`}>{dots}</g>

      {eyes.map(([x, y]) => (
        <g key={`${x}-${y}`} fill="none" stroke={`url(#${gradientId})`}>
          <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={1.8} strokeWidth={1} />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={1} fill={`url(#${gradientId})`} stroke="none" />
        </g>
      ))}

      <rect x={pad} y={pad} width={PAD} height={PAD} rx={2} fill="#ffffff" />
      <WaveGlyph x={pad + 1.5} y={pad + 1.5} size={PAD - 3} gradientId={gradientId} />
    </svg>
  );
}