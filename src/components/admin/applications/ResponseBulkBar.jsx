import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Columns } from 'lucide-react';
import { RESPONSE_STATUS } from '@/lib/applicationTypes';
import { sendApplicationUpdateEmail } from '@/lib/userEmails';
import { useAuth } from '@/lib/AuthContext';
import NewBadge from '@/components/ui/new-badge';

export default function ResponseBulkBar({ selected, responses, application, onDone, onClear, onCompare }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  // Bug 1 fix: Bulk status updates now record reviewed_by, reviewed_at, send in-app Notification, email applicant, and sync to Google Sheets
  const apply = async (fields) => {
    setBusy(true);
    try {
      const nowIso = new Date().toISOString();
      const extraMeta = fields.status
        ? { reviewed_by: user?.email || '', reviewed_at: nowIso }
        : {};
      const payload = { ...fields, ...extraMeta };
      const items = selected.map((id) => ({ id, ...payload }));
      await base44.entities.ApplicationResponse.bulkUpdate(items);
      const affected = responses.filter((r) => selected.includes(r.id));

      if (fields.status) {
        const changed = affected.filter((r) => r.status !== fields.status);
        const decided = fields.status === 'accepted' || fields.status === 'rejected';
        const notifItems = changed
          .filter((r) => r.roblox_username)
          .map((r) => ({
            roblox_username: r.roblox_username,
            title: decided
              ? `Application ${fields.status}`
              : `Application status: ${RESPONSE_STATUS[fields.status]?.label || fields.status}`,
            body: decided
              ? `Your application for "${application?.title || r.application_title}" was ${fields.status}.`
              : `Your application for "${application?.title || r.application_title}" is now ${RESPONSE_STATUS[fields.status]?.label || fields.status}.`,
            type: 'staff_message',
            read: false,
          }));
        if (notifItems.length > 0) {
          base44.entities.Notification.bulkCreate(notifItems).catch(() => {});
        }
        Promise.allSettled(
          changed.map((r) =>
            sendApplicationUpdateEmail({
              response: { ...r, ...payload },
              application: application || { id: r.application_id, title: r.application_title },
              eventType: 'status_update',
              previousStatus: r.status,
            })
          )
        ).catch(() => {});
        changed.forEach((r) => {
          base44.functions.invoke('syncApplicationToSheet', { response_id: r.id }).catch(() => {});
        });
      }

      onDone(affected.map((r) => ({ ...r, ...payload })));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
      <span className="text-xs text-cyan-200 mr-1">{selected.length} selected</span>
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />}
      {Object.entries(RESPONSE_STATUS).map(([k, s]) => (
        <button key={k} disabled={busy} onClick={() => apply({ status: k })} className={`px-2.5 h-7 rounded-md text-xs border ${s.cls}`}>
          Mark {s.label}
        </button>
      ))}
      <button disabled={busy} onClick={() => apply({ starred: true })} className="px-2.5 h-7 rounded-md text-xs border border-amber-500/30 text-amber-200">
        ★ Shortlist
      </button>
      {selected.length >= 2 && selected.length <= 4 && onCompare && (
        <button
          type="button"
          onClick={onCompare}
          className="px-2.5 h-7 rounded-md text-xs border border-cyan-400/40 bg-cyan-500/15 text-cyan-200 inline-flex items-center gap-1.5 font-semibold"
        >
          <Columns className="h-3.5 w-3.5" />
          <span>Compare ({selected.length})</span>
          <NewBadge />
        </button>
      )}
      <button onClick={onClear} className="ml-auto text-xs text-slate-400 hover:text-white">
        Clear
      </button>
    </div>
  );
}