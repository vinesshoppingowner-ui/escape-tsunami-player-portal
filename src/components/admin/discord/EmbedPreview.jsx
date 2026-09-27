export default function EmbedPreview({ content, embed }) {
  return (
    <div className="rounded-xl bg-[#313338] p-4 text-[#dbdee1] text-sm">
      {content && <p className="whitespace-pre-wrap mb-2">{content}</p>}
      {embed && (
        <div className="rounded bg-[#2b2d31] border-l-4 p-3 max-w-md" style={{ borderColor: embed.colorHex }}>
          {embed.title && <div className="font-semibold text-white">{embed.title}</div>}
          {embed.description && <p className="mt-1 whitespace-pre-wrap">{embed.description}</p>}
          {embed.image && <img src={embed.image} alt="" className="mt-2 rounded max-h-60" />}
          {embed.footer && <div className="mt-2 text-xs text-[#949ba3]">{embed.footer}</div>}
        </div>
      )}
      {!content && !embed && <p className="text-[#949ba3]">Nothing to preview yet.</p>}
    </div>
  );
}