import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * Renders a scannable QR code for a value as a crisp PNG data URL.
 */
export default function QrCode({ value, size = 216, className = '', alt = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setSrc('');
      return;
    }
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 0,
      width: size * 2,
      color: { dark: '#0B0D13', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return <div className={`bg-white ${className}`} style={{ width: size, height: size }} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={alt || `QR code for ${value}`}
      width={size}
      height={size}
      className={className}
    />
  );
}