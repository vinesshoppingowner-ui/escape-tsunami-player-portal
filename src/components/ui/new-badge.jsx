import React from 'react';

export default function NewBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#ccf0d8] text-[#14261c] text-[11px] font-semibold leading-tight tracking-tight shadow-sm select-none shrink-0 ${className}`}
    >
      New
    </span>
  );
}