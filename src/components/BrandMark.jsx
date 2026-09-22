export default function BrandMark({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${className} shrink-0 text-cyan-400`}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* solid wave silhouette — filled crest with trailing water */}
      <path d="M2 20.5c3.2-9 8.2-13.5 15-13.5 5.6 0 9 3.1 9 7.3 0 3.4-2.3 5.9-5.4 5.9-2.6 0-4.4-1.7-4.4-3.9 0-1.9 1.3-3.2 3-3.2.6 0 1.1.1 1.5.4-2.3-1.9-5-1.4-7.2.6-2.1 1.9-3.7 4.7-4.8 8.1L2 20.5z" />
      <path d="M3 25.2c2 0 3.1 1.4 5.2 1.4s3.2-1.4 5.2-1.4 3.1 1.4 5.2 1.4 3.2-1.4 5.2-1.4c.9 0 1.6.3 2.4.7v2.3c-.8-.4-1.5-.7-2.4-.7-2 0-3.1 1.4-5.2 1.4s-3.2-1.4-5.2-1.4-3.1 1.4-5.2 1.4S5 27.5 3 27.5v-2.3z" />
    </svg>
  );
}