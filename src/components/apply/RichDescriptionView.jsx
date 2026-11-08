import { isRichHtml, sanitizeRichHtml } from '@/lib/richDescription';

export default function RichDescriptionView({ value, fallback, className = '' }) {
  const content = String(value || '').trim();

  if (!content) {
    if (!fallback) return null;
    return <p className={`text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-md mx-auto ${className}`}>{fallback}</p>;
  }

  if (!isRichHtml(content)) {
    return (
      <div className={`text-sm sm:text-base text-slate-300/85 leading-relaxed max-w-lg mx-auto whitespace-pre-line ${className}`}>
        {content}
      </div>
    );
  }

  const safeHtml = sanitizeRichHtml(content);

  return (
    <div
      className={`rich-description text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-lg mx-auto text-left
        [&_p]:my-1.5 [&_div]:my-1
        [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-3 [&_h2]:mb-1.5
        [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-semibold [&_h3]:text-slate-100 [&_h3]:mt-2.5 [&_h3]:mb-1
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1
        [&_li]:text-slate-200
        [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/60 [&_blockquote]:bg-cyan-500/[0.06] [&_blockquote]:pl-3.5 [&_blockquote]:py-1.5 [&_blockquote]:my-2.5 [&_blockquote]:rounded-r-lg [&_blockquote]:text-slate-200
        [&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-cyan-200
        [&_hr]:border-white/10 [&_hr]:my-3
        ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}