// Branded, embed-style HTML email (email-safe tables + inline styles).
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Pick an accent from the subject when the caller doesn't set one.
const guessAccent = (subject = '') => {
  const s = subject.toLowerCase();
  if (/approved|accepted|verified|unban|repealed/.test(s)) return '#22c55e';
  if (/denied|rejected|ban|kick/.test(s)) return '#ef4444';
  if (/warning|mute|review/.test(s)) return '#f59e0b';
  return '#22d3ee';
};

export function renderEmail({ subject, title, body = '', fields = [], accent, ctaLabel = 'Open Member Portal', ctaUrl }) {
  const color = accent || guessAccent(subject);
  const url = ctaUrl || `${window.location.origin}/portal`;
  const paragraphs = esc(body)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const fieldRows = fields.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border-collapse:separate;border-spacing:0 8px;">
        ${fields.map((f) => `<tr>
          <td style="width:38%;padding:10px 12px;background:#0f172a;border-radius:8px 0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;font-weight:600;">${esc(f.name)}</td>
          <td style="padding:10px 12px;background:#0f172a;border-radius:0 8px 8px 0;font-size:14px;color:#f1f5f9;font-weight:600;">${esc(f.value || '—')}</td>
        </tr>`).join('')}
      </table>`
    : '';

  return `<!doctype html><html><body style="margin:0;padding:0;background:#060b16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060b16;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#22d3ee,#2563eb);text-align:center;font-size:20px;color:#fff;">🌊</td>
            <td style="padding-left:12px;">
              <div style="font-size:16px;font-weight:700;color:#fff;">Escape Tsunami for Developers</div>
              <div style="font-size:12px;color:#64748b;">Member Portal</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#111827;border:1px solid #1f2937;border-left:5px solid ${color};border-radius:14px;padding:26px 26px 22px;">
          <div style="font-size:21px;font-weight:700;color:#fff;margin:0 0 14px;">${esc(title || subject)}</div>
          ${paragraphs}
          ${fieldRows}
          <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#2563eb);background-color:#2563eb;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${esc(ctaLabel)} →</a>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:#475569;text-align:center;">
          You're receiving this because you have an account on the Escape Tsunami for Developers Member Portal.<br/>— Escape Tsunami for Developers Staff Team
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}