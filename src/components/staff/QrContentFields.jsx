import { Loader2 } from 'lucide-react';
import { PORTAL_PAGES } from '@/lib/qrActions';

const INPUT =
  'mt-2 h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50';
const SELECT = `${INPUT} appearance-none`;

/** The fields that belong to the selected code type. */
export default function QrContentFields({ mode, form, onChange, applications, loadingApps }) {
  if (mode === 'signin') {
    return (
      <>
        <label htmlFor="qr-email" className="text-xs font-medium text-slate-300">Member email</label>
        <input
          id="qr-email"
          type="email"
          autoFocus
          placeholder="player@example.com"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={INPUT}
        />

        <label htmlFor="qr-password" className="mt-4 flex items-center justify-between text-xs font-medium text-slate-300">
          Account password
          <span className="font-normal text-slate-500">optional</span>
        </label>
        <input
          id="qr-password"
          type="password"
          autoComplete="off"
          placeholder="Leave blank to have them type it"
          value={form.password}
          onChange={(e) => onChange('password', e.target.value)}
          className={INPUT}
        />
      </>
    );
  }

  if (mode === 'portal') {
    return (
      <>
        <label htmlFor="qr-page" className="text-xs font-medium text-slate-300">Portal page</label>
        <select
          id="qr-page"
          value={form.portalPath}
          onChange={(e) => onChange('portalPath', e.target.value)}
          className={SELECT}
        >
          {PORTAL_PAGES.map((page) => (
            <option key={page.path} value={page.path} className="bg-[#111521]">
              {page.label} — {page.hint}
            </option>
          ))}
        </select>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Pages that need an account send members to the sign-in screen first, then straight through.
        </p>
      </>
    );
  }

  if (mode === 'application') {
    return (
      <>
        <label htmlFor="qr-application" className="text-xs font-medium text-slate-300">Application form</label>
        <select
          id="qr-application"
          value={form.applicationId}
          onChange={(e) => onChange('applicationId', e.target.value)}
          className={SELECT}
          disabled={loadingApps}
        >
          <option value="" className="bg-[#111521]">
            {loadingApps ? 'Loading forms…' : applications.length ? 'Choose a form…' : 'No forms yet'}
          </option>
          {applications.map((app) => (
            <option key={app.id} value={app.id} className="bg-[#111521]">
              {app.title}{app.status ? ` — ${app.status}` : ''}
            </option>
          ))}
        </select>
        {loadingApps && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading your forms
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <label htmlFor="qr-url" className="text-xs font-medium text-slate-300">Destination URL</label>
      <input
        id="qr-url"
        type="url"
        autoFocus
        placeholder="https://discord.gg/…"
        value={form.customUrl}
        onChange={(e) => onChange('customUrl', e.target.value)}
        className={INPUT}
      />

      <label htmlFor="qr-label" className="mt-4 flex items-center justify-between text-xs font-medium text-slate-300">
        Card title
        <span className="font-normal text-slate-500">optional</span>
      </label>
      <input
        id="qr-label"
        type="text"
        maxLength={40}
        placeholder="Community Discord"
        value={form.customLabel}
        onChange={(e) => onChange('customLabel', e.target.value)}
        className={INPUT}
      />
    </>
  );
}